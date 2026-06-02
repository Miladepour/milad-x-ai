import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getBlogPostAdmin, listBlogPostsAdmin, upsertBlogPost } from "@/lib/blog/store";
import type { BlogPost } from "@/lib/blog/types";
import {
  getCourseAdmin,
  importStaticCourses,
  listCoursesAdmin,
  upsertCourse,
} from "@/lib/courses/store";
import { revalidateCoursePaths } from "@/lib/courses/revalidate";
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
        author: String(body.author ?? "Milad"),
        slug: String(body.slug ?? ""),
        coverImage: body.coverImage ? String(body.coverImage) : null,
        excerpt: String(body.excerpt ?? ""),
        content: String(body.content ?? ""),
        date: String(body.date ?? ""),
        publishedAt: String(body.publishedAt ?? ""),
      });

      // Refresh blog listing/detail and sitemap immediately after publish.
      const blogPaths = [
        "/blog",
        `/blog/${post.slug}`,
        "/en/blog",
        `/en/blog/${post.slug}`,
        "/fa/blog",
        `/fa/blog/${post.slug}`,
        "/sitemap.xml",
      ];
      for (const path of blogPaths) revalidatePath(path);

      return NextResponse.json({ ok: true, post });
    }

    if (action === "list-posts") {
      const posts = await listBlogPostsAdmin();
      return NextResponse.json({ ok: true, posts });
    }

    if (action === "get-post") {
      const slug = String(body.slug ?? "").trim();
      const locale = body.locale === "FA" ? "FA" : "EN";
      if (!slug) {
        return NextResponse.json({ error: "slug is required" }, { status: 400 });
      }
      const post = await getBlogPostAdmin(slug, locale);
      return NextResponse.json({ ok: true, post });
    }

    if (action === "list-courses") {
      const courses = await listCoursesAdmin();
      return NextResponse.json({ ok: true, courses });
    }

    if (action === "get-course") {
      const slug = String(body.slug ?? "").trim();
      if (!slug) {
        return NextResponse.json({ error: "slug is required" }, { status: 400 });
      }
      const course = await getCourseAdmin(slug);
      return NextResponse.json({ ok: true, course });
    }

    if (action === "publish-course") {
      const payload = body.course ?? body;
      const publishNow = body.publishNow !== false;
      if (publishNow && (!payload.publishedAt || payload.publishedAt === null)) {
        payload.publishedAt = new Date().toISOString();
      }
      const course = await upsertCourse(payload);
      revalidateCoursePaths(course.slug);
      return NextResponse.json({ ok: true, course });
    }

    if (action === "unpublish-course") {
      const slug = String(body.slug ?? "").trim();
      const existing = await getCourseAdmin(slug);
      if (!existing) {
        return NextResponse.json({ error: "Course not found" }, { status: 404 });
      }
      existing.publishedAt = null;
      const course = await upsertCourse(existing);
      revalidateCoursePaths(course.slug);
      return NextResponse.json({ ok: true, course });
    }

    if (action === "import-static-courses") {
      const course = await importStaticCourses();
      revalidateCoursePaths(course.slug);
      return NextResponse.json({ ok: true, course });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
