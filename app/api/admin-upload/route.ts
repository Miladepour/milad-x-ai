import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/supabase/require-admin";
import { createServiceClient } from "@/lib/supabase/server";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
const MIME_TO_EXT: Record<(typeof ALLOWED_TYPES)[number], string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};
const ALLOWED_BUCKETS = ["course-images", "blog-images"] as const;

export async function POST(request: Request) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!(ALLOWED_TYPES as readonly string[]).includes(file.type)) {
    return NextResponse.json(
      { error: "Only JPEG, PNG, WebP and GIF images are allowed" },
      { status: 400 }
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File must be under 5 MB" }, { status: 400 });
  }

  const ext = MIME_TO_EXT[file.type as (typeof ALLOWED_TYPES)[number]];
  const nameExt = file.name.split(".").pop()?.toLowerCase();
  const allowedNameExts = new Set(["jpg", "jpeg", "png", "webp", "gif"]);
  if (nameExt && !allowedNameExts.has(nameExt)) {
    return NextResponse.json({ error: "Invalid file extension" }, { status: 400 });
  }
  if (nameExt === "jpeg" && ext !== "jpg") {
    return NextResponse.json({ error: "File type mismatch" }, { status: 400 });
  }
  if (nameExt && nameExt !== "jpeg" && nameExt !== ext) {
    return NextResponse.json({ error: "File type mismatch" }, { status: 400 });
  }
  const slug =
    String(formData.get("slug") ?? "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-") || "upload";
  const bucketRaw = String(formData.get("bucket") ?? "course-images").trim();
  const bucket = (ALLOWED_BUCKETS as readonly string[]).includes(bucketRaw)
    ? (bucketRaw as (typeof ALLOWED_BUCKETS)[number])
    : "course-images";
  const filename = `${slug}-${Date.now()}.${ext}`;

  const supabase = createServiceClient();

  // Ensure bucket exists (idempotent)
  await supabase.storage.createBucket(bucket, { public: true }).catch(() => {});

  const arrayBuffer = await file.arrayBuffer();
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filename, arrayBuffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filename);

  return NextResponse.json({ ok: true, url: urlData.publicUrl });
}
