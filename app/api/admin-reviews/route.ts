import { NextResponse } from "next/server";
import { parseEmailBannerId } from "@/lib/email/banners";
import { sendLoggedStudentBroadcastEmails } from "@/lib/email/send-logged-student-broadcast";
import { renderStudentBroadcastEmail } from "@/lib/email/student-broadcast";
import { sanitizeEmailHtml } from "@/lib/email/sanitize-html";
import { getProgramAdmin, resolveStudentEmailRecipients } from "@/lib/members/store";
import { resolveProgramTitle } from "@/lib/members/program-localized";
import {
  defaultReviewInviteBodyHtml,
  defaultReviewInviteSubject,
} from "@/lib/reviews/invite-email";
import { reviewAbsoluteUrl } from "@/lib/reviews/paths";
import {
  listProgramReviewsAdmin,
  updateProgramReviewStatusAdmin,
} from "@/lib/reviews/store";
import type { ProgramReviewStatus } from "@/lib/reviews/types";
import { SERVER_ERROR_MESSAGE } from "@/lib/security/api-errors";
import { getAdminUser } from "@/lib/supabase/require-admin";

function parsePreviewLocale(value: unknown): "EN" | "FA" {
  return value === "FA" ? "FA" : "EN";
}

function parseReviewStatus(value: unknown): ProgramReviewStatus | null {
  if (
    value === "pending" ||
    value === "approved" ||
    value === "rejected" ||
    value === "published"
  ) {
    return value;
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as Record<string, unknown>;
    const action = String(body.action ?? "");

    if (action === "list-reviews") {
      const programId = String(body.programId ?? "").trim() || undefined;
      const status = parseReviewStatus(body.status) ?? undefined;
      const locale = body.locale === "FA" || body.locale === "EN" ? body.locale : undefined;
      const reviews = await listProgramReviewsAdmin({ programId, status, locale });
      return NextResponse.json({ ok: true, reviews });
    }

    if (action === "update-review-status") {
      const reviewId = String(body.reviewId ?? "").trim();
      const status = parseReviewStatus(body.status);
      if (!reviewId || !status) {
        return NextResponse.json({ error: "reviewId and status required" }, { status: 400 });
      }
      const review = await updateProgramReviewStatusAdmin(reviewId, status);
      return NextResponse.json({ ok: true, review });
    }

    if (action === "preview-review-invite") {
      const programId = String(body.programId ?? "").trim();
      const previewLocale = parsePreviewLocale(body.previewLocale);
      const bannerId = parseEmailBannerId(body.bannerId);

      if (!programId) {
        return NextResponse.json({ error: "programId required" }, { status: 400 });
      }

      const programBundle = await getProgramAdmin(programId);
      if (!programBundle) {
        return NextResponse.json({ error: "Program not found" }, { status: 404 });
      }

      const recipients = await resolveStudentEmailRecipients({
        type: "program",
        programId,
      });

      const programTitle = resolveProgramTitle(programBundle.program, previewLocale);
      const reviewUrl = reviewAbsoluteUrl({
        locale: previewLocale,
        programSlug: programBundle.program.slug,
      });
      const subject =
        String(body.subject ?? "").trim() ||
        defaultReviewInviteSubject({ locale: previewLocale, programTitle });
      const bodyHtml =
        sanitizeEmailHtml(String(body.bodyHtml ?? "")) ||
        defaultReviewInviteBodyHtml({
          locale: previewLocale,
          programTitle,
          reviewUrl,
        });

      const sampleRecipient = recipients[0] ?? {
        email: "student@example.com",
        fullName: previewLocale === "FA" ? "دانشجو" : "Student",
        locale: previewLocale,
      };

      const html = renderStudentBroadcastEmail({
        bodyHtml,
        fullName: sampleRecipient.fullName,
        locale: previewLocale,
        bannerId,
      });

      return NextResponse.json({
        ok: true,
        html,
        subject,
        recipientCount: recipients.length,
        reviewUrl,
        sampleRecipient: {
          email: sampleRecipient.email,
          fullName: sampleRecipient.fullName,
          locale: sampleRecipient.locale === "FA" ? "FA" : "EN",
        },
      });
    }

    if (action === "send-review-invite") {
      const programId = String(body.programId ?? "").trim();
      const inviteLocale = parsePreviewLocale(body.inviteLocale);
      const bannerId = parseEmailBannerId(body.bannerId);

      if (!programId) {
        return NextResponse.json({ error: "programId required" }, { status: 400 });
      }

      const programBundle = await getProgramAdmin(programId);
      if (!programBundle) {
        return NextResponse.json({ error: "Program not found" }, { status: 404 });
      }

      const recipients = await resolveStudentEmailRecipients({
        type: "program",
        programId,
      });

      if (recipients.length === 0) {
        return NextResponse.json({ error: "No recipients for this program" }, { status: 400 });
      }

      const programTitle = resolveProgramTitle(programBundle.program, inviteLocale);
      const reviewUrl = reviewAbsoluteUrl({
        locale: inviteLocale,
        programSlug: programBundle.program.slug,
      });
      const subject =
        String(body.subject ?? "").trim() ||
        defaultReviewInviteSubject({ locale: inviteLocale, programTitle });
      const bodyHtml =
        sanitizeEmailHtml(String(body.bodyHtml ?? "")) ||
        defaultReviewInviteBodyHtml({
          locale: inviteLocale,
          programTitle,
          reviewUrl,
        });

      const localizedRecipients = recipients.map((student) => ({
        ...student,
        locale: inviteLocale,
      }));

      const result = await sendLoggedStudentBroadcastEmails({
        subject,
        bodyHtml,
        recipients: localizedRecipients,
        audienceType: "program",
        audienceLabel: `Review invite · ${programTitle}`,
        programId,
        sentBy: admin.id,
        bannerId,
      });

      return NextResponse.json({
        ok: true,
        sent: result.sent,
        failed: result.failed,
        total: recipients.length,
        reviewUrl,
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("[admin-reviews] error:", error);
    return NextResponse.json({ error: SERVER_ERROR_MESSAGE }, { status: 500 });
  }
}
