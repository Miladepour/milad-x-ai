export interface Tutorial {
  slug: string;
  title: string;
  author: string;
  excerpt: string;
  coverImage?: string;
  /** ISO date for sorting and display */
  publishedAt: string;
  /** Display date string */
  date: string;
  locale: "EN" | "FA";
  youtubeId: string;
  content: string;
}
