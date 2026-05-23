export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  /** ISO date for sorting */
  publishedAt: string;
  locale: "EN" | "FA";
}
