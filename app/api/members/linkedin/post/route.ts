import { NextResponse } from "next/server";
import {
  createLinkedInImagePost,
  getLinkedInPersonUrn,
  uploadLinkedInImage,
} from "@/lib/linkedin/api";
import { isLinkedInPostingConfigured } from "@/lib/linkedin/config";
import {
  clearLinkedInAccessToken,
  getLinkedInAccessToken,
} from "@/lib/linkedin/cookies";
import { formatLinkedInError } from "@/lib/linkedin/errors";
import { buildLinkedInPostShareText } from "@/lib/members/certificate-utils";
import { getStudentUser } from "@/lib/supabase/require-student";

export const dynamic = "force-dynamic";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

export async function POST(request: Request) {
  const student = await getStudentUser();
  if (!student) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isLinkedInPostingConfigured()) {
    return NextResponse.json(
      { error: "LinkedIn posting is not configured." },
      { status: 503 }
    );
  }

  const accessToken = getLinkedInAccessToken();
  if (!accessToken) {
    return NextResponse.json({ error: "LinkedIn authorization required." }, { status: 401 });
  }

  const formData = await request.formData();
  const image = formData.get("image");
  const programTitle = String(formData.get("programTitle") ?? "").trim();
  const verifyUrl = String(formData.get("verifyUrl") ?? "").trim();

  if (!(image instanceof File) || !programTitle) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (image.size > MAX_IMAGE_BYTES) {
    return NextResponse.json({ error: "Certificate image is too large." }, { status: 400 });
  }

  const commentary = buildLinkedInPostShareText({
    programTitle,
    verifyUrl: verifyUrl || undefined,
  });

  try {
    const personUrn = await getLinkedInPersonUrn(accessToken);
    const imageBytes = await image.arrayBuffer();
    const imageUrn = await uploadLinkedInImage(accessToken, personUrn, imageBytes);
    const post = await createLinkedInImagePost(
      accessToken,
      personUrn,
      commentary,
      imageUrn
    );

    clearLinkedInAccessToken();

    return NextResponse.json({
      ok: true,
      postId: post.id ?? null,
      feedUrl: "https://www.linkedin.com/feed/",
    });
  } catch (error) {
    console.error("[linkedin/post]", error);
    clearLinkedInAccessToken();
    const message =
      error instanceof Error
        ? error.message.replace(/^(LinkedIn [^:]+ failed: )/, "")
        : "Could not publish to LinkedIn. Try again.";
    return NextResponse.json(
      { error: formatLinkedInError(message) },
      { status: 502 }
    );
  }
}
