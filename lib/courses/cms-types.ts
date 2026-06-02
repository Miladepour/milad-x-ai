import type {
  CourseFaqItem,
  CourseInclude,
  CourseInsights,
  CourseMeta,
  CourseSection,
  CourseStatus,
} from "./types";

/** JSONB payload stored per locale row */
export interface CourseLocaleContent {
  meta: CourseMeta;
  includes: CourseInclude[];
  insights: CourseInsights;
  faq: CourseFaqItem[];
  sections: CourseSection[];
}

export interface CourseLocaleInput {
  listTitle: string;
  title: string;
  subtitle: string;
  excerpt: string;
  date: string;
  status: CourseStatus;
  /** Iran display price in millions of Toman (FA only, e.g. 2.5). */
  priceToman?: number | null;
  content: CourseLocaleContent;
}

export interface CourseAdminPayload {
  slug: string;
  coverImage: string;
  priceUsd: number;
  sortOrder: number;
  publishedAt: string | null;
  locales: {
    EN: CourseLocaleInput;
    FA: CourseLocaleInput;
  };
}

export interface CourseListItem {
  slug: string;
  coverImage: string;
  priceUsd: number;
  sortOrder: number;
  publishedAt: string | null;
  enTitle: string;
  enStatus: CourseStatus;
  faTitle: string;
  faStatus: CourseStatus;
}
