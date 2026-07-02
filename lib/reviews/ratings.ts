export const REVIEW_RATING_KEYS = [
  "overall",
  "clarity",
  "usefulness",
  "teaching",
  "recommend",
] as const;

export type ReviewRatingKey = (typeof REVIEW_RATING_KEYS)[number];

export interface ProgramReviewRatings {
  overall: number;
  clarity: number;
  usefulness: number;
  teaching: number;
  recommend: number;
}

export const REVIEW_RATING_ADMIN_LABELS: Record<ReviewRatingKey, string> = {
  overall: "Overall experience",
  clarity: "Content clarity",
  usefulness: "Usefulness for goals",
  teaching: "Teaching style",
  recommend: "Likelihood to recommend",
};

/** Full question text as shown on the public review form (English). */
export const REVIEW_RATING_ADMIN_QUESTIONS: Record<ReviewRatingKey, string> = {
  overall: "Overall, how would you rate your experience with this course?",
  clarity: "How clear and easy to follow was the course content?",
  usefulness: "How useful was the course for your goals?",
  teaching: "How satisfied were you with the teaching style and explanation?",
  recommend: "How likely are you to recommend this course to others?",
};

export function averageReviewRating(ratings: ProgramReviewRatings): number {
  const sum = REVIEW_RATING_KEYS.reduce((total, key) => total + ratings[key], 0);
  return Math.round((sum / REVIEW_RATING_KEYS.length) * 10) / 10;
}

export function hasDetailedReviewRatings(row: {
  rating_clarity: number | null;
  rating_usefulness: number | null;
  rating_teaching: number | null;
  rating_recommend: number | null;
}): boolean {
  return (
    row.rating_clarity != null &&
    row.rating_usefulness != null &&
    row.rating_teaching != null &&
    row.rating_recommend != null
  );
}

export const REVIEW_RATING_DB_COLUMNS: Record<
  ReviewRatingKey,
  keyof import("@/lib/supabase/database.types").ProgramReviewRow
> = {
  overall: "rating_overall",
  clarity: "rating_clarity",
  usefulness: "rating_usefulness",
  teaching: "rating_teaching",
  recommend: "rating_recommend",
};
