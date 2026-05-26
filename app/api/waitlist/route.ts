import { NextResponse } from "next/server";
import { getCountryName } from "@/lib/countries";
import { isPublishedCourseSlug } from "@/lib/courses/store";
import { createAnonClient } from "@/lib/supabase/server";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const courseSlug = String(body.courseSlug ?? "").trim();
    const fullName = String(body.fullName ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const mobile = String(body.mobile ?? "").trim();
    const country = String(body.country ?? "").trim();
    const locale = String(body.locale ?? "EN").trim();

    if (!courseSlug || !(await isPublishedCourseSlug(courseSlug))) {
      return NextResponse.json({ error: "Invalid course" }, { status: 400 });
    }
    if (fullName.length < 2) {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }
    if (mobile.length < 6) {
      return NextResponse.json({ error: "Invalid mobile" }, { status: 400 });
    }
    if (!getCountryName(country)) {
      return NextResponse.json({ error: "Invalid country" }, { status: 400 });
    }

    const supabase = createAnonClient();
    const { error } = await supabase.from("waitlist_submissions").insert({
      course_slug: courseSlug,
      full_name: fullName,
      email,
      mobile,
      country,
      locale,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
