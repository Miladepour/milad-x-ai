import { NextResponse } from "next/server";
import { buildBunnyEmbedUrl } from "@/lib/members/bunny-embed-server";
import { SERVER_ERROR_MESSAGE } from "@/lib/security/api-errors";
import { getStudentUser } from "@/lib/supabase/require-student";

export async function GET(request: Request) {
  const student = await getStudentUser();
  if (!student) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = new URL(request.url).searchParams;
  const videoUrl = params.get("videoUrl")?.trim();
  if (!videoUrl) {
    return NextResponse.json({ error: "videoUrl required" }, { status: 400 });
  }

  const autoplay = params.get("autoplay") === "true";
  const preload = params.get("preload") === "true";

  try {
    const embedUrl = buildBunnyEmbedUrl(videoUrl, { autoplay, preload });
    if (!embedUrl) {
      return NextResponse.json(
        {
          error:
            "Could not parse Bunny video URL. Use embed, play, HLS, or direct play URL from Bunny.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ embedUrl });
  } catch (error) {
    console.error("[members/bunny-embed]", error);
    return NextResponse.json({ error: SERVER_ERROR_MESSAGE }, { status: 500 });
  }
}
