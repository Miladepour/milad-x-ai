import { NextResponse } from "next/server";
import { parseEmailBannerId } from "@/lib/email/banners";
import { sendLoggedStudentBroadcastEmails } from "@/lib/email/send-logged-student-broadcast";
import { renderStudentBroadcastEmail } from "@/lib/email/student-broadcast";
import { sanitizeEmailHtml } from "@/lib/email/sanitize-html";
import { sendAccessExpiringEmail, sendInviteEmail } from "@/lib/email/resend";
import {
  dateInputToEndIso,
  dateInputToStartIso,
  startOfTodayIso,
} from "@/lib/members/dates";
import { clearStudentDevicesAdmin } from "@/lib/members/device-store";
import {
  addEnrollmentAdmin,
  deleteAnnouncementAdmin,
  deleteEnrollmentAdmin,
  deleteLessonAdmin,
  deleteProgramAdmin,
  deleteStudentAdmin,
  getProgramAdmin,
  getStudentAdmin,
  inviteStudentAdmin,
  checkStudentInviteAdmin,
  listAnnouncementsAdmin,
  listEnrollmentsAdmin,
  listProgramsAdmin,
  reorderLessonsAdmin,
  resendStudentInviteAdmin,
  resolveStudentEmailRecipients,
  syncExpiredEnrollments,
  type StudentEmailAudience,
  updateEnrollmentAdmin,
  updateStudentAdmin,
  upsertAnnouncementAdmin,
  upsertLessonAdmin,
  upsertProgramAdmin,
} from "@/lib/members/store";
import {
  issueCertificateAdmin,
  revokeCertificateAdmin,
} from "@/lib/members/certificate-store";
import {
  getQuizForLessonAdmin,
  saveQuizForLessonAdmin,
} from "@/lib/members/quiz-store";
import { listStudentEmailHistoryAdmin } from "@/lib/members/student-email-store";
import type { StudentAnnouncementPayload } from "@/lib/members/types";
import type { PaymentCurrency } from "@/lib/members/types";
import type {
  InviteStudentPayload,
  MemberProgramPayload,
  ProgramLessonPayload,
} from "@/lib/members/types";
import type { QuizQuestionPayload } from "@/lib/members/types";
import { SERVER_ERROR_MESSAGE } from "@/lib/security/api-errors";
import { getAdminUser } from "@/lib/supabase/require-admin";

function parseAccessStart(value: unknown): string {
  const raw = String(value ?? "").trim();
  if (!raw) return startOfTodayIso();
  if (raw.includes("T")) return raw;
  return dateInputToStartIso(raw);
}

function parseAccessEnd(value: unknown): string | null {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  if (raw.includes("T")) return raw;
  return dateInputToEndIso(raw);
}

function parseCurrency(value: unknown): PaymentCurrency | null {
  if (value === "USD" || value === "GBP" || value === "IRR") return value;
  return null;
}

function parseStudentEmailAudience(body: Record<string, unknown>): StudentEmailAudience | null {
  const type = String(body.audienceType ?? "");
  if (type === "all") return { type: "all" };
  if (type === "student") {
    const studentId = String(body.studentId ?? "").trim();
    return studentId ? { type: "student", studentId } : null;
  }
  if (type === "program") {
    const programId = String(body.programId ?? "").trim();
    return programId ? { type: "program", programId } : null;
  }
  return null;
}

function parsePreviewLocale(value: unknown): "EN" | "FA" {
  return value === "FA" ? "FA" : "EN";
}

async function buildAudienceLabel(
  audience: StudentEmailAudience,
  recipients: Awaited<ReturnType<typeof resolveStudentEmailRecipients>>
): Promise<string> {
  if (audience.type === "all") {
    return "All students";
  }
  if (audience.type === "student") {
    const student = recipients[0];
    return student?.fullName?.trim() || student?.email || "One student";
  }
  const program = await getProgramAdmin(audience.programId);
  return program?.program.title ?? "Program enrollment";
}

export async function POST(request: Request) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const action = String(body.action ?? "");

    if (action === "list-programs") {
      const programs = await listProgramsAdmin();
      return NextResponse.json({ ok: true, programs });
    }

    if (action === "get-program") {
      const idOrSlug = String(body.id ?? body.slug ?? "").trim();
      if (!idOrSlug) {
        return NextResponse.json({ error: "id or slug required" }, { status: 400 });
      }
      const data = await getProgramAdmin(idOrSlug);
      if (!data) {
        return NextResponse.json({ error: "Program not found" }, { status: 404 });
      }
      return NextResponse.json({ ok: true, ...data });
    }

    if (action === "save-program") {
      const payload = body.program as MemberProgramPayload;
      const hasTitle = payload?.titleEn?.trim() || payload?.titleFa?.trim();
      if (!hasTitle) {
        return NextResponse.json(
          { error: "Program title (English or Farsi) is required" },
          { status: 400 }
        );
      }
      const program = await upsertProgramAdmin(payload);
      return NextResponse.json({ ok: true, program });
    }

    if (action === "save-lesson") {
      const payload = body.lesson as ProgramLessonPayload;
      const hasTitle =
        payload?.titleEn?.trim() || payload?.titleFa?.trim();
      if (!payload?.programId || !hasTitle) {
        return NextResponse.json(
          { error: "programId and title (EN or FA) are required" },
          { status: 400 }
        );
      }
      const lesson = await upsertLessonAdmin(payload);
      return NextResponse.json({ ok: true, lesson });
    }

    if (action === "get-lesson-quiz") {
      const lessonId = String(body.lessonId ?? "").trim();
      if (!lessonId) {
        return NextResponse.json({ error: "lessonId required" }, { status: 400 });
      }
      const questions = await getQuizForLessonAdmin(lessonId);
      return NextResponse.json({ ok: true, questions });
    }

    if (action === "save-lesson-quiz") {
      const lessonId = String(body.lessonId ?? "").trim();
      const questions = Array.isArray(body.questions)
        ? (body.questions as QuizQuestionPayload[])
        : [];
      if (!lessonId) {
        return NextResponse.json({ error: "lessonId required" }, { status: 400 });
      }
      const saved = await saveQuizForLessonAdmin(lessonId, questions);
      return NextResponse.json({ ok: true, questions: saved });
    }

    if (action === "reorder-lessons") {
      const programId = String(body.programId ?? "");
      const lessonIds = Array.isArray(body.lessonIds)
        ? body.lessonIds.map(String)
        : [];
      if (!programId || lessonIds.length === 0) {
        return NextResponse.json({ error: "programId and lessonIds required" }, { status: 400 });
      }
      await reorderLessonsAdmin(programId, lessonIds);
      return NextResponse.json({ ok: true });
    }

    if (action === "delete-lesson") {
      const lessonId = String(body.lessonId ?? "");
      if (!lessonId) {
        return NextResponse.json({ error: "lessonId required" }, { status: 400 });
      }
      await deleteLessonAdmin(lessonId);
      return NextResponse.json({ ok: true });
    }

    if (action === "delete-program") {
      const programId = String(body.programId ?? "");
      if (!programId) {
        return NextResponse.json({ error: "programId required" }, { status: 400 });
      }
      await deleteProgramAdmin(programId);
      return NextResponse.json({ ok: true });
    }

    if (action === "list-enrollments") {
      await syncExpiredEnrollments();
      const enrollments = await listEnrollmentsAdmin();
      return NextResponse.json({ ok: true, enrollments });
    }

    if (action === "list-students") {
      const students = await resolveStudentEmailRecipients({ type: "all" });
      return NextResponse.json({ ok: true, students });
    }

    if (action === "get-student") {
      const studentId = String(body.studentId ?? "");
      if (!studentId) {
        return NextResponse.json({ error: "studentId required" }, { status: 400 });
      }
      const student = await getStudentAdmin(studentId);
      if (!student) {
        return NextResponse.json({ error: "Student not found" }, { status: 404 });
      }
      return NextResponse.json({ ok: true, student });
    }

    if (action === "update-student") {
      const studentId = String(body.studentId ?? "");
      if (!studentId) {
        return NextResponse.json({ error: "studentId required" }, { status: 400 });
      }
      const profile = await updateStudentAdmin({
        studentId,
        fullName: body.fullName,
        locale: body.locale === "FA" ? "FA" : body.locale === "EN" ? "EN" : undefined,
        phone: body.phone,
        notes: body.notes,
      });
      return NextResponse.json({ ok: true, profile });
    }

    if (action === "add-enrollment") {
      const studentId = String(body.studentId ?? "");
      const programId = String(body.programId ?? "");
      if (!studentId || !programId) {
        return NextResponse.json(
          { error: "studentId and programId required" },
          { status: 400 }
        );
      }
      const enrollment = await addEnrollmentAdmin(
        {
          studentId,
          programId,
          accessStartsAt: parseAccessStart(body.accessStartsAt),
          accessEndsAt: parseAccessEnd(body.accessEndsAt),
          amountPaid:
            body.amountPaid != null && body.amountPaid !== ""
              ? Number(body.amountPaid)
              : null,
          currency: parseCurrency(body.currency),
          status: body.status,
        },
        admin.id
      );
      return NextResponse.json({ ok: true, enrollment });
    }

    if (action === "delete-enrollment") {
      const enrollmentId = String(body.enrollmentId ?? "");
      if (!enrollmentId) {
        return NextResponse.json({ error: "enrollmentId required" }, { status: 400 });
      }
      await deleteEnrollmentAdmin(enrollmentId);
      return NextResponse.json({ ok: true });
    }

    if (action === "update-enrollment") {
      const enrollmentId = String(body.enrollmentId ?? "");
      if (!enrollmentId) {
        return NextResponse.json({ error: "enrollmentId required" }, { status: 400 });
      }
      const enrollment = await updateEnrollmentAdmin(enrollmentId, {
        status: body.status,
        accessStartsAt: body.accessStartsAt
          ? parseAccessStart(body.accessStartsAt)
          : undefined,
        accessEndsAt:
          body.accessEndsAt !== undefined
            ? parseAccessEnd(body.accessEndsAt)
            : undefined,
        amountPaid:
          body.amountPaid !== undefined
            ? body.amountPaid === null || body.amountPaid === ""
              ? null
              : Number(body.amountPaid)
            : undefined,
        currency:
          body.currency !== undefined ? parseCurrency(body.currency) : undefined,
      });
      return NextResponse.json({ ok: true, enrollment });
    }

    if (action === "check-student-invite") {
      const email = String(body.email ?? "").trim();
      const programId = String(body.programId ?? "").trim();
      if (!email || !programId) {
        return NextResponse.json(
          { error: "email and programId are required" },
          { status: 400 }
        );
      }

      const check = await checkStudentInviteAdmin(email, programId);
      return NextResponse.json({ ok: true, check });
    }

    if (action === "invite-student") {
      const payload = body as InviteStudentPayload & { action?: string };
      if (!payload.email?.trim() || !payload.programId) {
        return NextResponse.json(
          { error: "email and programId are required" },
          { status: 400 }
        );
      }

      const programData = await getProgramAdmin(payload.programId);
      if (!programData) {
        return NextResponse.json({ error: "Program not found" }, { status: 404 });
      }

      const { student, enrollment, inviteLink } = await inviteStudentAdmin(
        {
          email: payload.email,
          fullName: payload.fullName ?? "",
          locale: payload.locale === "FA" ? "FA" : "EN",
          phone: payload.phone ?? null,
          notes: payload.notes ?? null,
          programId: payload.programId,
          accessStartsAt: parseAccessStart(payload.accessStartsAt),
          accessEndsAt: parseAccessEnd(payload.accessEndsAt),
          amountPaid:
            payload.amountPaid != null ? Number(payload.amountPaid) : null,
          currency: parseCurrency(payload.currency),
          allowExisting: Boolean(payload.allowExisting),
        },
        admin.id
      );

      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
        "https://www.mxaiacademy.com";

      await sendInviteEmail({
        to: student.email,
        fullName: student.fullName,
        programTitle: programData.program.title,
        accessStartsAt: enrollment.accessStartsAt,
        accessEndsAt: enrollment.accessEndsAt,
        inviteLink,
        locale: student.locale,
      });

      return NextResponse.json({ ok: true, student, enrollment });
    }

    if (action === "resend-student-invite") {
      const studentId = String(body.studentId ?? "").trim();
      const programId = String(body.programId ?? "").trim() || null;
      if (!studentId) {
        return NextResponse.json({ error: "studentId required" }, { status: 400 });
      }

      const { student, enrollment, inviteLink } = await resendStudentInviteAdmin(
        studentId,
        programId
      );

      if (!enrollment.program) {
        return NextResponse.json({ error: "Program not found" }, { status: 404 });
      }

      await sendInviteEmail({
        to: student.email,
        fullName: student.fullName,
        programTitle: enrollment.program.title,
        accessStartsAt: enrollment.accessStartsAt,
        accessEndsAt: enrollment.accessEndsAt,
        inviteLink,
        locale: student.locale,
      });

      return NextResponse.json({ ok: true, student, enrollment });
    }

    if (action === "clear-student-devices") {
      const studentId = String(body.studentId ?? "").trim();
      if (!studentId) {
        return NextResponse.json({ error: "studentId required" }, { status: 400 });
      }
      await clearStudentDevicesAdmin(studentId);
      return NextResponse.json({ ok: true });
    }

    if (action === "delete-student") {
      const studentId = String(body.studentId ?? "").trim();
      if (!studentId) {
        return NextResponse.json({ error: "studentId required" }, { status: 400 });
      }
      await deleteStudentAdmin(studentId);
      return NextResponse.json({ ok: true });
    }

    if (action === "list-announcements") {
      const announcements = await listAnnouncementsAdmin();
      return NextResponse.json({ ok: true, announcements });
    }

    if (action === "save-announcement") {
      const payload = body as StudentAnnouncementPayload & { action?: string };
      if (!payload.title?.trim()) {
        return NextResponse.json({ error: "title is required" }, { status: 400 });
      }

      const audienceType =
        payload.audienceType === "student" ||
        payload.audienceType === "programs" ||
        payload.audienceType === "all"
          ? payload.audienceType
          : "all";

      if (audienceType === "student" && !String(payload.studentId ?? "").trim()) {
        return NextResponse.json({ error: "student is required" }, { status: 400 });
      }

      const programIds = Array.isArray(payload.programIds)
        ? payload.programIds.map((id) => String(id)).filter(Boolean)
        : [];

      if (audienceType === "programs" && programIds.length === 0) {
        return NextResponse.json(
          { error: "Select at least one program" },
          { status: 400 }
        );
      }

      const linkUrl = String(payload.linkUrl ?? "").trim();
      const linkLabel = String(payload.linkLabel ?? "").trim();

      const announcement = await upsertAnnouncementAdmin({
        id: payload.id,
        title: payload.title,
        body: payload.body ?? "",
        locale: "ALL",
        audienceType,
        studentId: audienceType === "student" ? String(payload.studentId) : null,
        programIds: audienceType === "programs" ? programIds : [],
        linkUrl: linkUrl || null,
        linkLabel: linkLabel || null,
        published: Boolean(payload.published),
        expiresAt:
          payload.expiresAt === null || payload.expiresAt === ""
            ? null
            : String(payload.expiresAt),
      });
      return NextResponse.json({ ok: true, announcement });
    }

    if (action === "delete-announcement") {
      const id = String(body.id ?? "");
      if (!id) {
        return NextResponse.json({ error: "id required" }, { status: 400 });
      }
      await deleteAnnouncementAdmin(id);
      return NextResponse.json({ ok: true });
    }

    if (action === "send-expiry-reminder") {
      const enrollmentId = String(body.enrollmentId ?? "");
      const enrollments = await listEnrollmentsAdmin();
      const item = enrollments.find((e) => e.id === enrollmentId);
      if (!item?.student || !item.program || !item.accessEndsAt) {
        return NextResponse.json({ error: "Enrollment not found" }, { status: 404 });
      }

      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
        "https://www.mxaiacademy.com";

      await sendAccessExpiringEmail({
        to: item.student.email,
        fullName: item.student.fullName,
        programTitle: item.program.title,
        accessEndsAt: item.accessEndsAt,
        contactUrl: `${siteUrl}/contact`,
        locale: item.student.locale,
      });

      return NextResponse.json({ ok: true });
    }

    if (action === "preview-student-email") {
      const subject = String(body.subject ?? "").trim();
      const bodyHtml = sanitizeEmailHtml(String(body.bodyHtml ?? ""));
      const audience = parseStudentEmailAudience(body);

      if (!subject) {
        return NextResponse.json({ error: "subject is required" }, { status: 400 });
      }
      if (!bodyHtml || bodyHtml === "<p></p>") {
        return NextResponse.json({ error: "email body is required" }, { status: 400 });
      }
      if (!audience) {
        return NextResponse.json({ error: "audience is required" }, { status: 400 });
      }

      const recipients = await resolveStudentEmailRecipients(audience);
      if (recipients.length === 0) {
        return NextResponse.json({ error: "No recipients match this audience" }, { status: 400 });
      }

      const previewLocale = parsePreviewLocale(body.previewLocale);
      const sample =
        audience.type === "student"
          ? recipients[0]
          : recipients.find((r) => r.locale === previewLocale) ?? recipients[0];

      const bannerId = parseEmailBannerId(body.bannerId);

      const html = renderStudentBroadcastEmail({
        bodyHtml,
        fullName: sample.fullName,
        locale: sample.locale,
        bannerId,
      });

      return NextResponse.json({
        ok: true,
        html,
        subject,
        bannerId,
        recipientCount: recipients.length,
        sampleRecipient: {
          email: sample.email,
          fullName: sample.fullName,
          locale: sample.locale,
        },
        recipients: recipients.map((r) => ({
          email: r.email,
          fullName: r.fullName,
          locale: r.locale,
        })),
      });
    }

    if (action === "list-student-email-history") {
      const campaigns = await listStudentEmailHistoryAdmin();
      return NextResponse.json({ ok: true, campaigns });
    }

    if (action === "send-student-email") {
      const subject = String(body.subject ?? "").trim();
      const bodyHtml = sanitizeEmailHtml(String(body.bodyHtml ?? ""));
      const audience = parseStudentEmailAudience(body);

      if (!subject) {
        return NextResponse.json({ error: "subject is required" }, { status: 400 });
      }
      if (!bodyHtml || bodyHtml === "<p></p>") {
        return NextResponse.json({ error: "email body is required" }, { status: 400 });
      }
      if (!audience) {
        return NextResponse.json({ error: "audience is required" }, { status: 400 });
      }

      const recipients = await resolveStudentEmailRecipients(audience);
      if (recipients.length === 0) {
        return NextResponse.json({ error: "No recipients match this audience" }, { status: 400 });
      }

      const audienceLabel = await buildAudienceLabel(audience, recipients);
      const bannerId = parseEmailBannerId(body.bannerId);

      const { sent, failed, campaignId } = await sendLoggedStudentBroadcastEmails({
        subject,
        bodyHtml,
        recipients,
        audienceType: audience.type,
        audienceLabel,
        programId: audience.type === "program" ? audience.programId : null,
        studentId: audience.type === "student" ? audience.studentId : null,
        sentBy: admin.id,
        bannerId,
      });

      if (sent === 0 && failed > 0) {
        return NextResponse.json(
          { error: "All emails failed to send. Check RESEND_API_KEY and EMAIL_FROM." },
          { status: 500 }
        );
      }

      return NextResponse.json({
        ok: true,
        sent,
        failed,
        total: recipients.length,
        campaignId,
      });
    }

    if (action === "issue-certificate") {
      const studentId = String(body.studentId ?? "").trim();
      const programId = String(body.programId ?? "").trim();
      if (!studentId || !programId) {
        return NextResponse.json(
          { error: "studentId and programId required" },
          { status: 400 }
        );
      }
      const certificate = await issueCertificateAdmin(studentId, programId, admin.id);
      return NextResponse.json({ ok: true, certificate });
    }

    if (action === "revoke-certificate") {
      const certificateId = String(body.certificateId ?? "").trim();
      if (!certificateId) {
        return NextResponse.json({ error: "certificateId required" }, { status: 400 });
      }
      await revokeCertificateAdmin(certificateId);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("[admin-members]", error);
    return NextResponse.json({ error: SERVER_ERROR_MESSAGE }, { status: 500 });
  }
}
