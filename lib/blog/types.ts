export interface BlogPost {
  slug: string;
  title: string;
  author: string;
  coverImage?: string | null;
  excerpt: string;
  content: string;
  date: string;
  /** ISO date for sorting */
  publishedAt: string;
  locale: "EN" | "FA";
}
