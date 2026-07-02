import { NextResponse } from "next/server";
import {
  getPublishedReviewProgramBySlug,
  listPublishedReviewPrograms,
  submitProgramReview,
} from "@/lib/reviews/store";
import { REVIEW_RATING_KEYS, type ProgramReviewRatings } from "@/lib/reviews/ratings";
import type { ProgramReviewSource } from "@/lib/reviews/types";
import {
  assertPublicFormAllowed,
  clampField,
  FORM_ERROR_MESSAGE,
} from "@/lib/security/forms";
import { SERVER_ERROR_MESSAGE } from "@/lib/security/api-errors";

function parseRating(value: unknown): number | null {
  const rating = Number(value);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return null;
  return rating;
}

function parseRatings(body: Record<string, unknown>): ProgramReviewRatings | null {
  const raw = body.ratings;
  if (!raw || typeof raw !== "object") return null;

  const ratings = raw as Record<string, unknown>;
  const parsed = {} as ProgramReviewRatings;

  for (const key of REVIEW_RATING_KEYS) {
    const value = parseRating(ratings[key]);
    if (!value) return null;
    parsed[key] = value;
  }

  return parsed;
}

function parseSource(value: unknown): ProgramReviewSource {
  return value === "email_invite" ? "email_invite" : "shared_link";
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const programSlug = searchParams.get("programSlug")?.trim();

    if (programSlug) {
      const program = await getPublishedReviewProgramBySlug(programSlug);
      if (!program) {
        return NextResponse.json({ error: "Program not found" }, { status: 404 });
      }
      return NextResponse.json({ ok: true, program });
    }

    const programs = await listPublishedReviewPrograms();
    return NextResponse.json({ ok: true, programs });
  } catch (error) {
    console.error("[reviews] GET failed:", error);
    return NextResponse.json({ error: SERVER_ERROR_MESSAGE }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    const gate = await assertPublicFormAllowed(body, request);
    if (!gate.ok) {
      return NextResponse.json({ error: FORM_ERROR_MESSAGE }, { status: gate.status });
    }

    const programId = clampField(String(body.programId ?? ""), 64);
    const reviewerName = clampField(String(body.reviewerName ?? ""), 200);
    const publicReview = clampField(String(body.publicReview ?? ""), 5000);
    const privateReview = clampField(String(body.privateReview ?? ""), 5000);
    const localeRaw = clampField(String(body.locale ?? "EN"), 10);
    const locale = localeRaw === "FA" ? "FA" : "EN";
    const ratings = parseRatings(body);
    const consentPublicDisplay = body.consentPublicDisplay === true;
    const source = parseSource(body.source);

    if (!programId) {
      return NextResponse.json({ error: "Invalid program" }, { status: 400 });
    }
    if (reviewerName.length < 2) {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 });
    }
    if (!ratings) {
      return NextResponse.json({ error: "Invalid ratings" }, { status: 400 });
    }
    if (publicReview.length < 10) {
      return NextResponse.json({ error: "Public review is too short" }, { status: 400 });
    }

    const result = await submitProgramReview({
      programId,
      reviewerName,
      ratings,
      publicReview,
      privateReview: privateReview || undefined,
      locale,
      source,
      consentPublicDisplay,
    });

    return NextResponse.json({ ok: true, id: result.id });
  } catch (error) {
    console.error("[reviews] POST failed:", error);
    return NextResponse.json({ error: FORM_ERROR_MESSAGE }, { status: 500 });
  }
}
