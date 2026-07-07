import { NextResponse } from "next/server";
import { buildBunnyEmbedUrl } from "@/lib/members/bunny-embed-server";
import {
  getAuthorizedLessonBunnyVideoUrl,
  type LessonProgramKind,
} from "@/lib/members/lesson-video-access";
import { SERVER_ERROR_MESSAGE } from "@/lib/security/api-errors";
import { getStudentUser } from "@/lib/supabase/require-student";

export async function GET(request: Request) {
  const student = await getStudentUser();
  if (!student) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = new URL(request.url).searchParams;
  const lessonId = params.get("lessonId")?.trim();
  const programSlug = params.get("programSlug")?.trim();
  if (!lessonId || !programSlug) {
    return NextResponse.json(
      { error: "lessonId and programSlug are required" },
      { status: 400 }
    );
  }

  const programKind: LessonProgramKind =
    params.get("programKind") === "bonus" ? "bonus" : "main";
  const autoplay = params.get("autoplay") === "true";
  const preload = params.get("preload") === "true";

  try {
    const videoUrl = await getAuthorizedLessonBunnyVideoUrl(
      student.user.id,
      programSlug,
      lessonId,
      programKind
    );
    if (!videoUrl) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const embedUrl = buildBunnyEmbedUrl(videoUrl, { autoplay, preload });
    if (!embedUrl) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ embedUrl });
  } catch (error) {
    console.error("[members/bunny-embed]", error);
    return NextResponse.json({ error: SERVER_ERROR_MESSAGE }, { status: 500 });
  }
}
