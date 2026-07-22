import { programReviewRowToReview } from "@/lib/reviews/mappers";
import { reviewProgramSlugForCourse } from "@/lib/reviews/course-program-slug";
import type {
  ProgramReview,
  ProgramReviewStatus,
  PublicProgramReview,
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

export async function listPublicProgramReviews(options: {
  locale: "EN" | "FA";
  limit?: number;
}): Promise<PublicProgramReview[]> {
  const supabase = createServiceClient();
  const limit = Math.min(Math.max(options.limit ?? 6, 1), 24);

  const { data, error } = await supabase
    .from("program_reviews")
    .select(
      `
      id,
      reviewer_name,
      rating,
      rating_overall,
      public_review,
      locale,
      member_programs (
        slug,
        title_en,
        title_fa,
        title
      )
    `
    )
    .eq("status", "published")
    .eq("consent_public_display", true)
    .eq("locale", options.locale)
    .order("submitted_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);

  return mapPublicReviewRows(data ?? [], options.locale);
}

function mapPublicReviewRows(
  data: unknown[],
  locale: "EN" | "FA"
): PublicProgramReview[] {
  type PublicReviewRow = {
    id: string;
    reviewer_name: string;
    rating: number;
    rating_overall: number | null;
    public_review: string;
    member_programs: ProgramMeta | ProgramMeta[] | null;
  };

  return data.map((raw) => {
    const row = raw as unknown as PublicReviewRow;
    const programRaw = row.member_programs;
    const program = Array.isArray(programRaw) ? programRaw[0] ?? null : programRaw;
    const meta = program ? programMetaFromRow(program) : null;
    const titleEn = meta?.titleEn ?? "";
    const titleFa = meta?.titleFa ?? "";
    const programTitle =
      locale === "FA" ? titleFa || titleEn : titleEn || titleFa;

    return {
      id: row.id,
      reviewerName: row.reviewer_name,
      rating: row.rating_overall ?? row.rating,
      publicReview: row.public_review,
      programSlug: meta?.slug ?? "",
      programTitle,
    };
  });
}

export async function listPublicProgramReviewsForCourse(options: {
  locale: "EN" | "FA";
  courseSlug: string;
  limit?: number;
}): Promise<PublicProgramReview[]> {
  const programSlug = reviewProgramSlugForCourse(options.courseSlug);
  const supabase = createServiceClient();
  const limit = Math.min(Math.max(options.limit ?? 12, 1), 24);

  const { data, error } = await supabase
    .from("program_reviews")
    .select(
      `
      id,
      reviewer_name,
      rating,
      rating_overall,
      public_review,
      locale,
      member_programs!inner (
        slug,
        title_en,
        title_fa,
        title
      )
    `
    )
    .eq("status", "published")
    .eq("consent_public_display", true)
    .eq("locale", options.locale)
    .eq("member_programs.slug", programSlug)
    .order("submitted_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return mapPublicReviewRows(data ?? [], options.locale);
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
