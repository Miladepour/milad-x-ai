import { NextResponse } from "next/server";
import { completeLessonCertificateFlow } from "@/lib/members/certificate-store";
import { submitQuizAttempt } from "@/lib/members/quiz-store";
import { getStudentBonusLesson } from "@/lib/members/bonus-store";
import {
  getStudentLesson,
  getCompletedLessonIds,
  upsertLessonProgress,
} from "@/lib/members/store";
import { isLessonUnlocked } from "@/lib/members/lesson-gating";
import { SERVER_ERROR_MESSAGE } from "@/lib/security/api-errors";
import { getStudentUser } from "@/lib/supabase/require-student";

export async function POST(request: Request) {
  const student = await getStudentUser();
  if (!student) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const action = String(body.action ?? "");

    if (action !== "submit") {
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    const lessonId = String(body.lessonId ?? "").trim();
    const programSlug = String(body.programSlug ?? "").trim();
    if (!lessonId || !programSlug) {
      return NextResponse.json(
        { error: "lessonId and programSlug are required" },
        { status: 400 }
      );
    }

    const programKind = body.programKind === "bonus" ? "bonus" : "main";
    const lessonData =
      programKind === "bonus"
        ? await getStudentBonusLesson(student.user.id, programSlug, lessonId)
        : await getStudentLesson(student.user.id, programSlug, lessonId);
    if (!lessonData) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    if (lessonData.lesson.lessonType !== "quiz") {
      return NextResponse.json({ error: "This lesson is not a quiz." }, { status: 400 });
    }

    if (programKind === "main") {
      if (lessonData.program.comingSoon) {
        return NextResponse.json(
          { error: "Course content is not available yet." },
          { status: 403 }
        );
      }

      const completedIds = await getCompletedLessonIds(
        student.user.id,
        lessonData.lessons.map((lesson) => lesson.id)
      );
      const unlock = isLessonUnlocked(lessonData.lessons, lessonId, completedIds);
      if (!unlock.unlocked) {
        return NextResponse.json(
          { error: "Complete the previous lesson first." },
          { status: 403 }
        );
      }
    }

    const answers =
      body.answers && typeof body.answers === "object"
        ? (body.answers as Record<string, string>)
        : {};

    const result = await submitQuizAttempt(
      student.user.id,
      lessonData.lesson,
      student.profile.locale,
      answers
    );

    let certificate = null;
    let programCompleted = false;
    let certificateEnabled = false;

    if (result.passed) {
      await upsertLessonProgress(student.user.id, lessonId, { completed: true });
      if (programKind === "main") {
        const flow = await completeLessonCertificateFlow(student.user.id, lessonId);
        certificate = flow.certificate;
        programCompleted = flow.programCompleted;
        certificateEnabled = flow.certificateEnabled;
      }
    }

    return NextResponse.json({
      ok: true,
      result,
      certificate,
      programCompleted,
      certificateEnabled,
    });
  } catch (error) {
    console.error("[members/quiz]", error);
    return NextResponse.json({ error: SERVER_ERROR_MESSAGE }, { status: 500 });
  }
}
