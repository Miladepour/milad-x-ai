import { NextResponse } from "next/server";
import { completeLessonCertificateFlow } from "@/lib/members/certificate-store";
import { isLessonContentLockedForStudent, upsertLessonProgress } from "@/lib/members/store";
import { SERVER_ERROR_MESSAGE } from "@/lib/security/api-errors";
import { getStudentUser } from "@/lib/supabase/require-student";

export async function POST(request: Request) {
  const student = await getStudentUser();
  if (!student) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const lessonId = String(body.lessonId ?? "");
    if (!lessonId) {
      return NextResponse.json({ error: "lessonId required" }, { status: 400 });
    }

    if (await isLessonContentLockedForStudent(student.user.id, lessonId)) {
      return NextResponse.json(
        { error: "Course content is not available yet." },
        { status: 403 }
      );
    }

    const progress = await upsertLessonProgress(student.user.id, lessonId, {
      lastPositionSeconds:
        typeof body.lastPositionSeconds === "number"
          ? body.lastPositionSeconds
          : undefined,
      completed: body.completed === true,
    });

    let certificate = null;
    let programCompleted = false;
    let certificateEnabled = false;

    if (body.completed === true) {
      const flow = await completeLessonCertificateFlow(student.user.id, lessonId);
      certificate = flow.certificate;
      programCompleted = flow.programCompleted;
      certificateEnabled = flow.certificateEnabled;
    }

    return NextResponse.json({
      ok: true,
      progress,
      certificate,
      programCompleted,
      certificateEnabled,
    });
  } catch (error) {
    console.error("[members/progress]", error);
    return NextResponse.json({ error: SERVER_ERROR_MESSAGE }, { status: 500 });
  }
}
