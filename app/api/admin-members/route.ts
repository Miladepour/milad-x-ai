import { NextResponse } from "next/server";
import { sendAccessExpiringEmail, sendInviteEmail } from "@/lib/email/resend";
import {
  deleteLessonAdmin,
  getProgramAdmin,
  inviteStudentAdmin,
  listEnrollmentsAdmin,
  listProgramsAdmin,
  reorderLessonsAdmin,
  syncExpiredEnrollments,
  updateEnrollmentAdmin,
  upsertLessonAdmin,
  upsertProgramAdmin,
} from "@/lib/members/store";
import type {
  InviteStudentPayload,
  MemberProgramPayload,
  ProgramLessonPayload,
} from "@/lib/members/types";
import { getAdminUser } from "@/lib/supabase/require-admin";

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
      if (!payload?.title?.trim()) {
        return NextResponse.json({ error: "title is required" }, { status: 400 });
      }
      const program = await upsertProgramAdmin(payload);
      return NextResponse.json({ ok: true, program });
    }

    if (action === "save-lesson") {
      const payload = body.lesson as ProgramLessonPayload;
      if (!payload?.programId || !payload?.title?.trim()) {
        return NextResponse.json(
          { error: "programId and title are required" },
          { status: 400 }
        );
      }
      const lesson = await upsertLessonAdmin(payload);
      return NextResponse.json({ ok: true, lesson });
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

    if (action === "list-enrollments") {
      await syncExpiredEnrollments();
      const enrollments = await listEnrollmentsAdmin();
      return NextResponse.json({ ok: true, enrollments });
    }

    if (action === "update-enrollment") {
      const enrollmentId = String(body.enrollmentId ?? "");
      if (!enrollmentId) {
        return NextResponse.json({ error: "enrollmentId required" }, { status: 400 });
      }
      const enrollment = await updateEnrollmentAdmin(enrollmentId, {
        status: body.status,
        accessStartsAt: body.accessStartsAt,
        accessEndsAt: body.accessEndsAt,
      });
      return NextResponse.json({ ok: true, enrollment });
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
          programId: payload.programId,
          accessStartsAt: payload.accessStartsAt || new Date().toISOString(),
          accessEndsAt: payload.accessEndsAt ?? null,
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

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
