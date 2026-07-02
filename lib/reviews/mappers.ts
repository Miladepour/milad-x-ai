import type { ProgramReviewRow } from "@/lib/supabase/database.types";
import type { ProgramReview } from "./types";
import type { ProgramReviewRatings } from "./ratings";
import { hasDetailedReviewRatings } from "./ratings";

function ratingsFromRow(row: ProgramReviewRow): ProgramReviewRatings {
  const detailed = hasDetailedReviewRatings(row);
  const overall = row.rating_overall ?? row.rating;

  if (!detailed) {
    return {
      overall,
      clarity: overall,
      usefulness: overall,
      teaching: overall,
      recommend: overall,
    };
  }

  return {
    overall,
    clarity: row.rating_clarity!,
    usefulness: row.rating_usefulness!,
    teaching: row.rating_teaching!,
    recommend: row.rating_recommend!,
  };
}

export function programReviewRowToReview(
  row: ProgramReviewRow,
  program?: { slug: string; titleEn: string; titleFa: string } | null
): ProgramReview {
  const titleEn = program?.titleEn?.trim() ?? "";
  const titleFa = program?.titleFa?.trim() ?? "";
  const ratings = ratingsFromRow(row);
  const detailedRatingsAvailable = hasDetailedReviewRatings(row);

  return {
    id: row.id,
    programId: row.program_id,
    programSlug: program?.slug ?? "",
    programTitle:
      row.locale === "FA"
        ? titleFa || titleEn
        : titleEn || titleFa,
    reviewerName: row.reviewer_name,
    rating: row.rating_overall ?? row.rating,
    ratings,
    detailedRatingsAvailable,
    publicReview: row.public_review,
    privateReview: row.private_review,
    locale: row.locale,
    source: row.source,
    status: row.status,
    consentPublicDisplay: row.consent_public_display,
    submittedAt: row.submitted_at,
    updatedAt: row.updated_at,
  };
}
