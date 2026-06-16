export type CourseStatus = "Live" | "Coming Soon" | "Closed";

export type TutorLocale = "EN" | "FA";

export interface TutorProfile {
  name: Record<TutorLocale, string>;
  portraitSrc: string;
  about: Record<TutorLocale, string[]>;
}

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
  /** Optional additional tutors/guest instructors (besides primary instructor). */
  tutors?: TutorProfile[];
  format: string;
  totalHours: string;
  partsCount: number;
  timezone: string;
  sessions: CourseSessionSchedule[];
  /** When set, primary CTA opens this URL (e.g. Telegram) instead of the waitlist page. */
  applyUrl?: string | null;
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
  /** Optional Iran price in millions of Toman (FA pages only). */
  priceToman?: number | null;
  meta: CourseMeta;
  includes: CourseInclude[];
  insights: CourseInsights;
  faq: CourseFaqItem[];
  sections: CourseSection[];
}

export interface WaitlistSubmission {
  id: string;
  courseSlug: string;
  fullName: string;
  email: string;
  mobile: string;
  country: string;
  locale: string;
  submittedAt: string;
  openedAt: string | null;
}
