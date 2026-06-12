"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import type { BlogPost, BlogPostListItem } from "@/lib/blog/types";
import type { ToastVariant } from "@/lib/notifications/types";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";

interface BlogEditorTabProps {
  blogPosts: BlogPostListItem[];
  adminRequest: (action: string, payload?: Record<string, unknown>) => Promise<unknown>;
  loadBlogPosts: () => Promise<void>;
  onStatus: (message: string, variant?: ToastVariant) => void;
}

function todayLabel() {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function BlogEditorTab({
  blogPosts,
  adminRequest,
  loadBlogPosts,
  onStatus,
}: BlogEditorTabProps) {
  const [post, setPost] = useState({
    locale: "EN",
    title: "",
    slug: "",
    author: "Milad",
    coverImage: "",
    excerpt: "",
    content: "",
    date: todayLabel(),
    publishedAt: new Date().toISOString().slice(0, 10),
  });
  const [loadingPost, setLoadingPost] = useState(false);
  const [blogImageUploading, setBlogImageUploading] = useState(false);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const inlineImageInputRef = useRef<HTMLInputElement>(null);

  const generatedSlug = useMemo(() => slugify(post.title), [post.title]);

  const editor = useEditor({
    extensions: [StarterKit, Image],
    content: post.content || "<p></p>",
    editorProps: {
      attributes: {
        class:
          "min-h-[360px] rounded-sm border border-surface bg-background/20 p-4 font-dm text-base leading-relaxed text-cream focus:outline-none",
      },
    },
    onUpdate({ editor: activeEditor }) {
      setPost((current) => ({ ...current, content: activeEditor.getHTML() }));
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const next = post.content || "<p></p>";
    if (current !== next) {
      editor.commands.setContent(next, { emitUpdate: false });
    }
  }, [editor, post.content]);

  async function uploadBlogImage(file: File, kind: "cover" | "inline") {
    setBlogImageUploading(true);
    onStatus("Uploading image…", "info");
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("slug", post.slug || generatedSlug || "blog");
      form.append("bucket", "blog-images");
      form.append("kind", kind);
      const res = await fetch("/api/admin-upload", { method: "POST", body: form });
      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !json.url) throw new Error(json.error || "Upload failed");
      onStatus("Image uploaded", "success");
      return json.url;
    } finally {
      setBlogImageUploading(false);
    }
  }

  async function handlePublish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onStatus("Publishing post...", "info");
    try {
      const publishedAt = new Date(post.publishedAt).toISOString();
      const data = (await adminRequest("publish-post", {
        ...post,
        coverImage: post.coverImage || null,
        slug: post.slug || generatedSlug,
        publishedAt,
      })) as { post: BlogPost };
      setPost((current) => ({
        ...current,
        slug: data.post.slug,
      }));
      await loadBlogPosts();
      onStatus(`Published: ${data.post.title}`, "success");
    } catch (error) {
      onStatus(error instanceof Error ? error.message : "Could not publish post.", "error");
    }
  }

  async function loadFullPost(item: BlogPostListItem) {
    setLoadingPost(true);
    onStatus(`Loading ${item.title}…`, "info");
    try {
      const data = (await adminRequest("get-post", {
        slug: item.slug,
        locale: item.locale,
      })) as { post: BlogPost | null };
      if (!data.post) {
        onStatus("Post not found", "error");
        return;
      }
      setPost({
        locale: data.post.locale,
        title: data.post.title,
        slug: data.post.slug,
        author: data.post.author,
        coverImage: data.post.coverImage ?? "",
        excerpt: data.post.excerpt,
        content: data.post.content,
        date: data.post.date,
        publishedAt: data.post.publishedAt.slice(0, 10),
      });
      onStatus(`Loaded: ${data.post.title} (${data.post.locale})`, "info");
    } catch (error) {
      onStatus(error instanceof Error ? error.message : "Could not load post.", "error");
    } finally {
      setLoadingPost(false);
    }
  }

  return (
    <form onSubmit={handlePublish} className="student-glass grid gap-5 lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-4">
        <input
          value={post.title}
          onChange={(event) =>
            setPost((current) => ({ ...current, title: event.target.value }))
          }
          className="form-field"
          placeholder="Post title"
        />
        <input
          value={post.slug}
          onChange={(event) =>
            setPost((current) => ({ ...current, slug: event.target.value }))
          }
          className="form-field"
          placeholder={`Slug, blank uses ${generatedSlug || "post-title"}`}
        />
        <div className="grid gap-3 md:grid-cols-2">
          <input
            value={post.author}
            onChange={(event) =>
              setPost((current) => ({ ...current, author: event.target.value }))
            }
            className="form-field"
            placeholder="Author (e.g. Milad)"
          />
          <div className="flex gap-2">
            <button
              type="button"
              disabled={blogImageUploading}
              onClick={() => coverInputRef.current?.click()}
              className="border border-orange px-4 py-2 font-mono text-xs uppercase tracking-widest text-orange hover:bg-orange hover:text-background disabled:cursor-not-allowed disabled:opacity-50"
            >
              {blogImageUploading ? "Uploading…" : "Upload cover"}
            </button>
            <input
              value={post.coverImage}
              onChange={(event) =>
                setPost((current) => ({ ...current, coverImage: event.target.value }))
              }
              className="form-field flex-1 font-mono text-xs"
              placeholder="Cover image URL (optional)"
            />
            <input
              ref={coverInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  const url = await uploadBlogImage(file, "cover");
                  setPost((c) => ({ ...c, coverImage: url }));
                } catch (err) {
                  onStatus(err instanceof Error ? err.message : "Upload failed", "error");
                } finally {
                  if (coverInputRef.current) coverInputRef.current.value = "";
                }
              }}
            />
          </div>
        </div>
        <textarea
          value={post.excerpt}
          onChange={(event) =>
            setPost((current) => ({ ...current, excerpt: event.target.value }))
          }
          className="form-field min-h-28"
          placeholder="Short excerpt for the blog listing"
        />
        <div className="rounded-sm border border-surface bg-surface/20">
          <div className="flex flex-wrap gap-2 border-b border-surface p-3">
            <button
              type="button"
              className="border border-surface px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-cream hover:border-orange hover:text-orange"
              onClick={() => editor?.chain().focus().toggleBold().run()}
            >
              Bold
            </button>
            <button
              type="button"
              className="border border-surface px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-cream hover:border-orange hover:text-orange"
              onClick={() => editor?.chain().focus().toggleItalic().run()}
            >
              Italic
            </button>
            <button
              type="button"
              className="border border-surface px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-cream hover:border-orange hover:text-orange"
              onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
            >
              H2
            </button>
            <button
              type="button"
              className="border border-surface px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-cream hover:border-orange hover:text-orange"
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
            >
              List
            </button>
            <button
              type="button"
              className="border border-surface px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-cream hover:border-orange hover:text-orange"
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            >
              1-2-3
            </button>
            <button
              type="button"
              disabled={blogImageUploading}
              className="border border-orange px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-orange hover:bg-orange hover:text-background disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => inlineImageInputRef.current?.click()}
            >
              Image
            </button>
            <input
              ref={inlineImageInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  const url = await uploadBlogImage(file, "inline");
                  editor?.chain().focus().setImage({ src: url }).run();
                } catch (err) {
                  onStatus(err instanceof Error ? err.message : "Upload failed", "error");
                } finally {
                  if (inlineImageInputRef.current) inlineImageInputRef.current.value = "";
                }
              }}
            />
          </div>
          <EditorContent editor={editor} />
        </div>
      </div>

      <aside className="flex flex-col gap-4 border border-surface bg-surface/30 p-5">
        <button
          type="button"
          onClick={() => {
            setPost({
              locale: "EN",
              title: "",
              slug: "",
              author: "Milad",
              coverImage: "",
              excerpt: "",
              content: "",
              date: todayLabel(),
              publishedAt: new Date().toISOString().slice(0, 10),
            });
            onStatus("Ready for a new post.", "info");
          }}
          className="border border-surface px-4 py-2 font-mono text-xs uppercase tracking-widest text-cream hover:border-orange hover:text-orange"
        >
          New post
        </button>
        <div className="max-h-64 overflow-auto border border-surface bg-background/30">
          {blogPosts.length === 0 ? (
            <p className="p-3 font-dm text-xs text-cream/60">No published posts yet.</p>
          ) : (
            <ul className="divide-y divide-surface">
              {blogPosts.map((item) => (
                <li key={`${item.slug}-${item.locale}`}>
                  <button
                    type="button"
                    disabled={loadingPost}
                    onClick={() => void loadFullPost(item)}
                    className="w-full px-3 py-2 text-left hover:bg-surface/40 disabled:opacity-50"
                  >
                    <p className="font-dm text-sm text-cream">{item.title}</p>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-cream/60">
                      {item.locale} · {item.slug}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <label className="flex flex-col gap-2 font-dm text-sm text-cream/80">
          Language
          <select
            value={post.locale}
            onChange={(event) =>
              setPost((current) => ({
                ...current,
                locale: (event.target.value === "FA" ? "FA" : "EN") as "EN" | "FA",
              }))
            }
            className="form-field"
          >
            <option value="EN">English</option>
            <option value="FA">Farsi</option>
          </select>
        </label>
        <label className="flex flex-col gap-2 font-dm text-sm text-cream/80">
          Display date
          <input
            value={post.date}
            onChange={(event) =>
              setPost((current) => ({ ...current, date: event.target.value }))
            }
            className="form-field"
          />
        </label>
        <label className="flex flex-col gap-2 font-dm text-sm text-cream/80">
          Publish date
          <input
            type="date"
            value={post.publishedAt}
            onChange={(event) =>
              setPost((current) => ({
                ...current,
                publishedAt: event.target.value,
              }))
            }
            className="form-field"
          />
        </label>
        <button className="mt-2 bg-orange px-5 py-3 font-mono text-xs uppercase tracking-widest text-background transition-colors hover:bg-cream">
          Publish
        </button>
      </aside>
    </form>
  );
}
