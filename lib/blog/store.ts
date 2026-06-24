import type { BlogPost, BlogPostListItem } from "./types";
import {
  createClient,
  isSupabaseConfigured,
} from "@/lib/supabase/server";
import { createBlogClient } from "@/lib/supabase/blog-client";
import { blogPostToRow, blogRowToPost } from "@/lib/supabase/mappers";

function normalizeSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

export async function getBlogPosts(locale: "EN" | "FA"): Promise<BlogPost[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = createBlogClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("locale", locale)
    .order("published_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => blogRowToPost(row as import("@/lib/supabase/database.types").BlogPostRow));
}

export async function getBlogPostBySlug(
  slug: string,
  locale: "EN" | "FA"
): Promise<BlogPost | undefined> {
  return (await getBlogPosts(locale)).find((post) => post.slug === slug);
}

export async function getAllBlogSlugs(): Promise<string[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = createBlogClient();
  const { data, error } = await supabase.from("blog_posts").select("slug");

  if (error) throw new Error(error.message);
  return Array.from(new Set((data ?? []).map((row) => row.slug)));
}

export async function upsertBlogPost(input: {
  slug?: string;
  title: string;
  author: string;
  coverImage?: string | null;
  excerpt: string;
  content: string;
  date: string;
  publishedAt: string;
  locale: "EN" | "FA";
}): Promise<BlogPost> {
  const title = input.title.trim();
  const author = input.author.trim();
  const excerpt = input.excerpt.trim();
  const content = input.content.trim();
  const date = input.date.trim();
  const slug = normalizeSlug(input.slug || title);

  if (title.length < 3) throw new Error("Title is too short");
  if (author.length < 2) throw new Error("Author is required");
  if (!slug) throw new Error("Slug is required");
  if (excerpt.length < 10) throw new Error("Excerpt is too short");
  if (content.length < 20) throw new Error("Content is too short");
  if (!date) throw new Error("Display date is required");

  const publishedAt = new Date(input.publishedAt || Date.now()).toISOString();
  const post: BlogPost = {
    slug,
    title,
    author,
    coverImage: input.coverImage ?? null,
    excerpt,
    content,
    date,
    publishedAt,
    locale: input.locale,
  };

  const supabase = createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .upsert(blogPostToRow(post), { onConflict: "slug,locale" })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return blogRowToPost(data as import("@/lib/supabase/database.types").BlogPostRow);
}

export async function listBlogPostsAdmin(): Promise<BlogPost[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .order("published_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) =>
    blogRowToPost(row as import("@/lib/supabase/database.types").BlogPostRow)
  );
}

export async function listBlogPostsAdminMeta(): Promise<BlogPostListItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("slug, title, author, cover_image, excerpt, date, published_at, locale")
    .order("published_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => {
    const typed = row as import("@/lib/supabase/database.types").BlogPostRow;
    return {
      slug: typed.slug,
      title: typed.title,
      author: typed.author,
      coverImage: typed.cover_image,
      excerpt: typed.excerpt,
      date: typed.date,
      publishedAt: typed.published_at,
      locale: typed.locale,
    };
  });
}

export async function getBlogPostAdmin(
  slug: string,
  locale: "EN" | "FA"
): Promise<BlogPost | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("locale", locale)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return blogRowToPost(data as import("@/lib/supabase/database.types").BlogPostRow);
}
