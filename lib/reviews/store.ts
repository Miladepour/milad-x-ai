import { programReviewRowToReview } from "@/lib/reviews/mappers";
import type {
  ProgramReview,
  ProgramReviewStatus,
  ReviewProgramOption,
  SubmitProgramReviewPayload,
} from "@/lib/reviews/types";
import type { ProgramReviewRow } from "@/lib/supabase/database.types";
import { createServiceClient } from "@/lib/supabase/server";

interface ProgramMeta {
  id: string;
  slug: string;
  title_en: string | null;
  title_fa: string | null;
  title: string;
}

function programMetaFromRow(row: ProgramMeta) {
  return {
    slug: row.slug,
    titleEn: (row.title_en ?? row.title ?? "").trim(),
    titleFa: (row.title_fa ?? row.title ?? "").trim(),
  };
}

export async function listPublishedReviewPrograms(): Promise<ReviewProgramOption[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("member_programs")
    .select("id, slug, title_en, title_fa, title")
    .eq("status", "published")
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);

  return (data as ProgramMeta[]).map((row) => ({
    id: row.id,
    slug: row.slug,
    titleEn: (row.title_en ?? row.title ?? "").trim(),
    titleFa: (row.title_fa ?? row.title ?? "").trim(),
  }));
}

export async function getPublishedReviewProgramBySlug(
  slug: string
): Promise<ReviewProgramOption | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("member_programs")
    .select("id, slug, title_en, title_fa, title")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  const row = data as ProgramMeta;
  return {
    id: row.id,
    slug: row.slug,
    titleEn: (row.title_en ?? row.title ?? "").trim(),
    titleFa: (row.title_fa ?? row.title ?? "").trim(),
  };
}

export async function submitProgramReview(
  payload: SubmitProgramReviewPayload
): Promise<{ id: string }> {
  const supabase = createServiceClient();

  const { data: program, error: programError } = await supabase
    .from("member_programs")
    .select("id")
    .eq("id", payload.programId)
    .eq("status", "published")
    .maybeSingle();

  if (programError) throw new Error(programError.message);
  if (!program) throw new Error("Program not found");

  const { data, error } = await supabase
    .from("program_reviews")
    .insert({
      program_id: payload.programId,
      reviewer_name: payload.reviewerName,
      rating: payload.ratings.overall,
      rating_overall: payload.ratings.overall,
      rating_clarity: payload.ratings.clarity,
      rating_usefulness: payload.ratings.usefulness,
      rating_teaching: payload.ratings.teaching,
      rating_recommend: payload.ratings.recommend,
      public_review: payload.publicReview,
      private_review: payload.privateReview?.trim() || null,
      locale: payload.locale,
      source: payload.source ?? "shared_link",
      consent_public_display: payload.consentPublicDisplay,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return { id: data.id };
}

export async function listProgramReviewsAdmin(options?: {
  programId?: string;
  status?: ProgramReviewStatus;
  locale?: "EN" | "FA";
}): Promise<ProgramReview[]> {
  const supabase = createServiceClient();

  let query = supabase
    .from("program_reviews")
    .select(
      `
      *,
      member_programs (
        slug,
        title_en,
        title_fa,
        title
      )
    `
    )
    .order("submitted_at", { ascending: false });

  if (options?.programId) {
    query = query.eq("program_id", options.programId);
  }
  if (options?.status) {
    query = query.eq("status", options.status);
  }
  if (options?.locale) {
    query = query.eq("locale", options.locale);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => {
    const reviewRow = row as ProgramReviewRow & {
      member_programs: ProgramMeta | null;
    };
    const program = reviewRow.member_programs;
    return programReviewRowToReview(
      reviewRow,
      program ? programMetaFromRow(program) : null
    );
  });
}

export async function updateProgramReviewStatusAdmin(
  reviewId: string,
  status: ProgramReviewStatus
): Promise<ProgramReview> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("program_reviews")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", reviewId)
    .select(
      `
      *,
      member_programs (
        slug,
        title_en,
        title_fa,
        title
      )
    `
    )
    .single();

  if (error) throw new Error(error.message);

  const reviewRow = data as ProgramReviewRow & {
    member_programs: ProgramMeta | null;
  };

  return programReviewRowToReview(
    reviewRow,
    reviewRow.member_programs
      ? programMetaFromRow(reviewRow.member_programs)
      : null
  );
}
