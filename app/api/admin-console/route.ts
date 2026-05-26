import { NextResponse } from "next/server";
import { upsertBlogPost } from "@/lib/blog/store";
import type { BlogPost } from "@/lib/blog/types";
import {
  contactRowToSubmission,
  waitlistRowToSubmission,
} from "@/lib/supabase/mappers";
import { createClient } from "@/lib/supabase/server";
import { getAdminUser } from "@/lib/supabase/require-admin";

export async function POST(request: Request) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const action = String(body.action ?? "");
    const supabase = createClient();

    if (action === "summary" || action === "login") {
      const [contactResult, waitlistResult] = await Promise.all([
        supabase
          .from("contact_submissions")
          .select("*")
          .order("submitted_at", { ascending: false }),
        supabase
          .from("waitlist_submissions")
          .select("*")
          .order("submitted_at", { ascending: false }),
      ]);

      if (contactResult.error) throw new Error(contactResult.error.message);
      if (waitlistResult.error) throw new Error(waitlistResult.error.message);

      return NextResponse.json({
        ok: true,
        email: admin.email,
        contactSubmissions: (contactResult.data ?? []).map(contactRowToSubmission),
        waitlistSubmissions: (waitlistResult.data ?? []).map(waitlistRowToSubmission),
      });
    }

    if (action === "publish-post") {
      const locale = body.locale === "FA" ? "FA" : "EN";
      const post: BlogPost = await upsertBlogPost({
        locale,
        title: String(body.title ?? ""),
        slug: String(body.slug ?? ""),
        excerpt: String(body.excerpt ?? ""),
        content: String(body.content ?? ""),
        date: String(body.date ?? ""),
        publishedAt: String(body.publishedAt ?? ""),
      });

      return NextResponse.json({ ok: true, post });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
