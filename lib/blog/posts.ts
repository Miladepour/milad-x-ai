import type { BlogPost } from "./types";

/** Published posts — add entries here when ready */
const postsEn: BlogPost[] = [];

const postsFa: BlogPost[] = [];

export function getBlogPosts(locale: "EN" | "FA"): BlogPost[] {
  const posts = locale === "FA" ? postsFa : postsEn;
  return [...posts].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export function getBlogPostBySlug(
  slug: string,
  locale: "EN" | "FA"
): BlogPost | undefined {
  return getBlogPosts(locale).find((p) => p.slug === slug);
}

export function getAllBlogSlugs(): string[] {
  const slugs = new Set<string>();
  for (const post of [...postsEn, ...postsFa]) {
    slugs.add(post.slug);
  }
  return Array.from(slugs);
}
