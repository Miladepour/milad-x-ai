export type CourseStatus = "Live" | "Coming Soon" | "Closed";

export type CourseBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "list"; items: string[]; ordered?: boolean }
  | {
      type: "items";
      items: { title: string; description: string }[];
    };

export interface CourseSection {
  id: string;
  title: string;
  blocks: CourseBlock[];
}

export interface CourseInclude {
  text: string;
}

export interface CourseInsights {
  audience: string[];
  topicsCount: number;
  requirements: string[];
}

export interface CourseSessionSchedule {
  id: string;
  date: string;
  time: string;
  durationHours: number;
}

export interface CourseMeta {
  instructor: string;
  format: string;
  totalHours: string;
  partsCount: number;
  timezone: string;
  sessions: CourseSessionSchedule[];
}

export interface CourseFaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface Course {
  slug: string;
  listTitle: string;
  title: string;
  subtitle: string;
  excerpt: string;
  status: CourseStatus;
  /** Display date for the workshop session */
  date: string;
  coverImage: string;
  priceUsd: number;
  meta: CourseMeta;
  includes: CourseInclude[];
  insights: CourseInsights;
  faq: CourseFaqItem[];
  sections: CourseSection[];
}

export interface WaitlistSubmission {
  courseSlug: string;
  fullName: string;
  email: string;
  mobile: string;
  country: string;
  locale: string;
  submittedAt: string;
}
