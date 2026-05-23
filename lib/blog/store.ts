import { promises as fs } from "fs";
import path from "path";
import type { BlogPost } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "blog-posts.json");

interface BlogStore {
  posts: BlogPost[];
}

function normalizeSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

async function readStore(): Promise<BlogStore> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw) as BlogStore;
    return { posts: Array.isArray(parsed.posts) ? parsed.posts : [] };
  } catch {
    return { posts: [] };
  }
}

async function writeStore(store: BlogStore) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(store, null, 2), "utf-8");
}

export async function getBlogPosts(locale: "EN" | "FA"): Promise<BlogPost[]> {
  const store = await readStore();
  return store.posts
    .filter((post) => post.locale === locale)
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
}

export async function getBlogPostBySlug(
  slug: string,
  locale: "EN" | "FA"
): Promise<BlogPost | undefined> {
  return (await getBlogPosts(locale)).find((post) => post.slug === slug);
}

export async function getAllBlogSlugs(): Promise<string[]> {
  const store = await readStore();
  return Array.from(new Set(store.posts.map((post) => post.slug)));
}

export async function upsertBlogPost(input: {
  slug?: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  publishedAt: string;
  locale: "EN" | "FA";
}): Promise<BlogPost> {
  const title = input.title.trim();
  const excerpt = input.excerpt.trim();
  const content = input.content.trim();
  const date = input.date.trim();
  const slug = normalizeSlug(input.slug || title);

  if (title.length < 3) throw new Error("Title is too short");
  if (!slug) throw new Error("Slug is required");
  if (excerpt.length < 10) throw new Error("Excerpt is too short");
  if (content.length < 20) throw new Error("Content is too short");
  if (!date) throw new Error("Display date is required");

  const publishedAt = new Date(input.publishedAt || Date.now()).toISOString();
  const post: BlogPost = {
    slug,
    title,
    excerpt,
    content,
    date,
    publishedAt,
    locale: input.locale,
  };

  const store = await readStore();
  const existingIndex = store.posts.findIndex(
    (item) => item.slug === slug && item.locale === input.locale
  );

  if (existingIndex >= 0) {
    store.posts[existingIndex] = post;
  } else {
    store.posts.push(post);
  }

  await writeStore(store);
  return post;
}
