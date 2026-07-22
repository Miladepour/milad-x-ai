import type { LocaleCode } from "@/lib/supabase/database.types";
import type { ProgramReviewRatings } from "./ratings";

export type ProgramReviewStatus = "pending" | "approved" | "rejected" | "published";
export type ProgramReviewSource = "shared_link" | "email_invite";

export interface ProgramReview {
  id: string;
  programId: string;
  programSlug: string;
  programTitle: string;
  reviewerName: string;
  /** Overall score, kept for quick display and sorting */
  rating: number;
  ratings: ProgramReviewRatings;
  /** False for legacy reviews submitted before per-question ratings existed */
  detailedRatingsAvailable: boolean;
  publicReview: string;
  privateReview: string | null;
  locale: LocaleCode;
  source: ProgramReviewSource;
  status: ProgramReviewStatus;
  consentPublicDisplay: boolean;
  submittedAt: string;
  updatedAt: string;
}

export interface ReviewProgramOption {
  id: string;
  slug: string;
  titleEn: string;
  titleFa: string;
}

/** Fields safe to expose on marketing pages */
export interface PublicProgramReview {
  id: string;
  reviewerName: string;
  rating: number;
  publicReview: string;
  programSlug: string;
  programTitle: string;
}

export interface SubmitProgramReviewPayload {
  programId: string;
  reviewerName: string;
  ratings: ProgramReviewRatings;
  publicReview: string;
  privateReview?: string;
  locale: LocaleCode;
  source?: ProgramReviewSource;
  consentPublicDisplay: boolean;
}
