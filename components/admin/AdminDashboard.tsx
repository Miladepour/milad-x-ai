"use client";

import dynamic from "next/dynamic";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import type { BlogPost } from "@/lib/blog/types";
import type { ContactSubmission } from "@/lib/contact/types";
import type { WaitlistSubmission } from "@/lib/courses/types";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";

const CourseEditor = dynamic(() => import("@/components/admin/CourseEditor"), {
  loading: () => (
    <p className="font-dm text-sm text-cream/70">Loading course editor…</p>
  ),
});

type AdminTab = "blog" | "contact" | "waitlist" | "courses";

interface AdminSummary {
  contactSubmissions: ContactSubmission[];
  waitlistSubmissions: WaitlistSubmission[];
}

interface SubmissionField {
  label: string;
  value: string;
  wide?: boolean;
}

interface SubmissionCard {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  fields: SubmissionField[];
}

interface AdminDashboardProps {
  adminEmail: string;
  summary: AdminSummary;
  blogPosts: BlogPost[];
  isBootstrapping: boolean;
  onSignOut: () => Promise<void>;
  adminRequest: (action: string, payload?: Record<string, unknown>) => Promise<unknown>;
  loadSummary: () => Promise<void>;
  loadBlogPosts: () => Promise<void>;
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

export default function AdminDashboard({
  adminEmail,
  summary,
  blogPosts,
  isBootstrapping,
  onSignOut,
  adminRequest,
  loadSummary,
  loadBlogPosts,
}: AdminDashboardProps) {
  const [tab, setTab] = useState<AdminTab>("blog");
  const [status, setStatus] = useState("");
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

  const coverInputRef = useRef<HTMLInputElement>(null);
  const inlineImageInputRef = useRef<HTMLInputElement>(null);
  const [blogImageUploading, setBlogImageUploading] = useState(false);

  const generatedSlug = useMemo(() => slugify(post.title), [post.title]);

  async function handlePublish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Publishing post...");
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
      setStatus(`Published: ${data.post.title}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not publish post.");
    }
  }

  async function uploadBlogImage(file: File, kind: "cover" | "inline") {
    setBlogImageUploading(true);
    setStatus("Uploading image…");
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("slug", post.slug || generatedSlug || "blog");
      form.append("bucket", "blog-images");
      form.append("kind", kind);
      const res = await fetch("/api/admin-upload", { method: "POST", body: form });
      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !json.url) throw new Error(json.error || "Upload failed");
      setStatus("Image uploaded ✓");
      return json.url;
    } finally {
      setBlogImageUploading(false);
      window.setTimeout(() => setStatus(""), 900);
    }
  }

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const next = post.content || "<p></p>";
    if (current !== next) {
      editor.commands.setContent(next, { emitUpdate: false });
    }
  }, [editor, post.content]);

  return (
    <div className="min-h-screen bg-background text-cream px-6 py-28">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <header className="flex flex-col gap-5 border-b border-surface pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-orange">
              Private console
            </p>
            <h1 className="mt-2 font-dm text-4xl font-semibold text-cream">
              Admin panel
            </h1>
            {adminEmail && (
              <p className="mt-2 font-dm text-sm text-cream/60">{adminEmail}</p>
            )}
          </div>
          <div className="flex flex-wrap gap-2 self-start">
            <button
              type="button"
              onClick={() => loadSummary()}
              disabled={isBootstrapping}
              className="border border-orange px-4 py-2 font-mono text-xs uppercase tracking-widest text-orange transition-colors hover:bg-orange hover:text-background disabled:cursor-not-allowed disabled:opacity-50"
            >
              Refresh inbox
            </button>
            <button
              type="button"
              onClick={() => onSignOut()}
              className="border border-surface px-4 py-2 font-mono text-xs uppercase tracking-widest text-cream transition-colors hover:border-orange hover:text-orange"
            >
              Sign out
            </button>
          </div>
        </header>

        {isBootstrapping && (
          <p className="font-dm text-sm text-cream/70">Loading inbox and posts…</p>
        )}

        <div className="flex flex-wrap gap-2">
          {[
            ["blog", "Publish blog"],
            ["courses", "Courses"],
            ["contact", `Contact forms (${summary.contactSubmissions.length})`],
            ["waitlist", `Waitlists (${summary.waitlistSubmissions.length})`],
          ].map(([value, label]) => (
            <button
              key={value}
              onClick={() => setTab(value as AdminTab)}
              className={`px-4 py-2 font-mono text-xs uppercase tracking-widest transition-colors ${
                tab === value
                  ? "bg-orange text-background"
                  : "border border-surface text-cream hover:border-orange"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {status && <p className="font-dm text-sm text-orange">{status}</p>}

        {tab === "courses" && (
          <CourseEditor adminRequest={adminRequest} onStatus={setStatus} />
        )}

        {tab === "blog" && (
          <form onSubmit={handlePublish} className="grid gap-5 lg:grid-cols-[1fr_320px]">
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
                    className="border border-orange px-4 py-2 font-mono text-xs uppercase tracking-widest text-orange hover:bg-orange hover:text-background disabled:opacity-50 disabled:cursor-not-allowed"
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
                        setStatus(err instanceof Error ? err.message : "Upload failed");
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
              <div className="border border-surface rounded-sm bg-surface/20">
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
                    className="border border-orange px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-orange hover:bg-orange hover:text-background disabled:opacity-50 disabled:cursor-not-allowed"
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
                        setStatus(err instanceof Error ? err.message : "Upload failed");
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
                  setStatus("Ready for a new post.");
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
                          onClick={() => {
                            setPost({
                              locale: item.locale,
                              title: item.title,
                              slug: item.slug,
                              author: item.author,
                              coverImage: item.coverImage ?? "",
                              excerpt: item.excerpt,
                              content: item.content,
                              date: item.date,
                              publishedAt: item.publishedAt.slice(0, 10),
                            });
                            setStatus(`Loaded: ${item.title} (${item.locale})`);
                          }}
                          className="w-full px-3 py-2 text-left hover:bg-surface/40"
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
        )}

        {tab === "contact" && (
          <SubmissionList
            empty="No contact forms yet."
            items={summary.contactSubmissions.map((item) => ({
              id: `${item.email}-${item.submittedAt}`,
              title: item.fullName,
              subtitle: `${item.inquiryType} · ${item.country}`,
              date: item.submittedAt,
              fields: [
                { label: "Full name", value: item.fullName },
                { label: "Email", value: item.email },
                { label: "Mobile", value: item.mobile },
                { label: "Country", value: item.country },
                { label: "Inquiry type", value: item.inquiryType },
                { label: "Language", value: item.locale },
                { label: "Submitted at", value: new Date(item.submittedAt).toLocaleString() },
                { label: "Message", value: item.message, wide: true },
              ],
            }))}
          />
        )}

        {tab === "waitlist" && (
          <SubmissionList
            empty="No waitlist forms yet."
            items={summary.waitlistSubmissions.map((item) => ({
              id: `${item.email}-${item.submittedAt}`,
              title: item.fullName,
              subtitle: `${item.courseSlug} · ${item.country}`,
              date: item.submittedAt,
              fields: [
                { label: "Full name", value: item.fullName },
                { label: "Email", value: item.email },
                { label: "Mobile", value: item.mobile },
                { label: "Country", value: item.country },
                { label: "Course", value: item.courseSlug },
                { label: "Language", value: item.locale },
                { label: "Submitted at", value: new Date(item.submittedAt).toLocaleString() },
              ],
            }))}
          />
        )}
      </div>
    </div>
  );
}

function SubmissionList({
  empty,
  items,
}: {
  empty: string;
  items: SubmissionCard[];
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const fromTime = dateFrom ? new Date(`${dateFrom}T00:00:00`).getTime() : null;
    const toTime = dateTo ? new Date(`${dateTo}T23:59:59`).getTime() : null;

    return items.filter((item) => {
      const submittedTime = new Date(item.date).getTime();
      const matchesDate =
        (!fromTime || submittedTime >= fromTime) &&
        (!toTime || submittedTime <= toTime);

      if (!matchesDate) return false;
      if (!normalizedQuery) return true;

      const searchable = [
        item.title,
        item.subtitle,
        item.date,
        ...item.fields.flatMap((field) => [field.label, field.value]),
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(normalizedQuery);
    });
  }, [dateFrom, dateTo, items, query]);

  async function copyField(key: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(key);
      window.setTimeout(() => setCopiedField(null), 1200);
    } catch {
      setCopiedField(null);
    }
  }

  if (items.length === 0) {
    return (
      <div className="border border-surface bg-surface/20 p-8 font-dm text-cream/70">
        {empty}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-3 border border-surface bg-surface/20 p-4 md:grid-cols-[1fr_190px_190px_auto]">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="form-field"
          placeholder="Search name, email, phone, country, message..."
        />
        <input
          type="date"
          value={dateFrom}
          onChange={(event) => setDateFrom(event.target.value)}
          className="form-field"
          aria-label="Filter from date"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(event) => setDateTo(event.target.value)}
          className="form-field"
          aria-label="Filter to date"
        />
        <button
          type="button"
          onClick={() => {
            setQuery("");
            setDateFrom("");
            setDateTo("");
          }}
          className="border border-surface px-4 py-3 font-mono text-xs uppercase tracking-widest text-cream transition-colors hover:border-orange hover:text-orange"
        >
          Clear
        </button>
      </div>

      <p className="font-mono text-xs uppercase tracking-widest text-cream/60">
        Showing {filteredItems.length} of {items.length}
      </p>

      {filteredItems.length === 0 ? (
        <div className="border border-surface bg-surface/20 p-8 font-dm text-cream/70">
          No submissions match your filters.
        </div>
      ) : (
        <ul className="grid gap-4">
          {filteredItems.map((item) => {
            const isOpen = openId === item.id;

            return (
              <li key={item.id} className="border border-surface bg-surface/25">
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : item.id)}
                  className="flex w-full flex-col gap-3 p-5 text-left transition-colors hover:bg-surface/35 md:flex-row md:items-start md:justify-between"
                  aria-expanded={isOpen}
                >
                  <div>
                    <h2 className="font-dm text-xl font-semibold text-cream">
                      {item.title}
                    </h2>
                    <p className="mt-1 font-dm text-sm text-cream/70">
                      {item.subtitle}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <time className="font-mono text-xs text-orange">
                      {new Date(item.date).toLocaleString()}
                    </time>
                    <span className="font-mono text-xl text-orange">
                      {isOpen ? "-" : "+"}
                    </span>
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-surface p-5">
                    <div className="grid gap-3 md:grid-cols-2">
                      {item.fields.map((field) => {
                        const key = `${item.id}-${field.label}`;

                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => copyField(key, field.value)}
                            className={`group border border-surface bg-background/40 p-4 text-left transition-colors hover:border-orange ${
                              field.wide ? "md:col-span-2" : ""
                            }`}
                          >
                            <span className="flex items-center justify-between gap-3 border-b border-surface pb-2">
                              <span className="font-mono text-[10px] uppercase tracking-widest text-orange">
                                {field.label}
                              </span>
                              <span className="font-mono text-[10px] uppercase tracking-widest text-cream/45 group-hover:text-orange">
                                {copiedField === key ? "Copied" : "Copy"}
                              </span>
                            </span>
                            <span className="mt-3 block whitespace-pre-wrap break-words font-dm text-sm leading-relaxed text-cream">
                              {field.value}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
