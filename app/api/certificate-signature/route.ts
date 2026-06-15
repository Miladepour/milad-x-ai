import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.CERTIFICATE_SIGNATURE_IMAGE_URL?.trim();
  if (!url) {
    return NextResponse.json({ error: "Not configured" }, { status: 404 });
  }

  try {
    const response = await fetch(url, { next: { revalidate: 86400 } });
    if (!response.ok) {
      return NextResponse.json({ error: "Signature unavailable" }, { status: 502 });
    }

    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "image/png";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch (error) {
    console.error("[certificate-signature]", error);
    return NextResponse.json({ error: "Signature unavailable" }, { status: 502 });
  }
}
