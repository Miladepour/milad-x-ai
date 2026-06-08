import { NextResponse } from "next/server";
import { getCountryName } from "@/lib/countries";
import { isPublishedCourseSlug } from "@/lib/courses/store";
import {
  assertPublicFormAllowed,
  clampField,
  FORM_ERROR_MESSAGE,
} from "@/lib/security/forms";
import { createServiceClient } from "@/lib/supabase/server";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    const gate = await assertPublicFormAllowed(body, request);
    if (!gate.ok) {
      return NextResponse.json({ error: FORM_ERROR_MESSAGE }, { status: gate.status });
    }

    const courseSlug = clampField(String(body.courseSlug ?? ""), 120);
    const fullName = clampField(String(body.fullName ?? ""), 200);
    const email = clampField(String(body.email ?? ""), 320).toLowerCase();
    const mobile = clampField(String(body.mobile ?? ""), 40);
    const country = clampField(String(body.country ?? ""), 10);
    const locale = clampField(String(body.locale ?? "EN"), 10);

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

    const supabase = createServiceClient();
    const { error } = await supabase.from("waitlist_submissions").insert({
      course_slug: courseSlug,
      full_name: fullName,
      email,
      mobile,
      country,
      locale,
    });

    if (error) {
      console.error("[waitlist] insert failed:", error.message);
      return NextResponse.json({ error: FORM_ERROR_MESSAGE }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[waitlist] unexpected error:", error);
    return NextResponse.json({ error: FORM_ERROR_MESSAGE }, { status: 500 });
  }
}
