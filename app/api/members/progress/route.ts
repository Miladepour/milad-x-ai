import { NextResponse } from "next/server";
import { upsertLessonProgress } from "@/lib/members/store";
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

    const progress = await upsertLessonProgress(student.user.id, lessonId, {
      lastPositionSeconds:
        typeof body.lastPositionSeconds === "number"
          ? body.lastPositionSeconds
          : undefined,
      completed: body.completed === true,
    });

    return NextResponse.json({ ok: true, progress });
  } catch (error) {
    console.error("[members/progress]", error);
    return NextResponse.json({ error: SERVER_ERROR_MESSAGE }, { status: 500 });
  }
}
