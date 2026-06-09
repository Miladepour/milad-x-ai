import { NextResponse } from "next/server";
import { getCountryName } from "@/lib/countries";
import type { ContactInquiryType } from "@/lib/contact/types";
import {
  assertPublicFormAllowed,
  clampField,
  FORM_ERROR_MESSAGE,
} from "@/lib/security/forms";
import { createServiceClient } from "@/lib/supabase/server";
import { notifyAdminsOfContactSubmission } from "@/lib/notifications/store";

const VALID_INQUIRY_TYPES: ContactInquiryType[] = ["private_course", "collaboration"];

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

    const fullName = clampField(String(body.fullName ?? ""), 200);
    const email = clampField(String(body.email ?? ""), 320).toLowerCase();
    const mobile = clampField(String(body.mobile ?? ""), 40);
    const country = clampField(String(body.country ?? ""), 10);
    const inquiryType = String(body.inquiryType ?? "").trim() as ContactInquiryType;
    const message = clampField(String(body.message ?? ""), 5000);
    const locale = clampField(String(body.locale ?? "EN"), 10);

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
    if (!VALID_INQUIRY_TYPES.includes(inquiryType)) {
      return NextResponse.json({ error: "Invalid inquiry type" }, { status: 400 });
    }
    if (message.length < 10) {
      return NextResponse.json({ error: "Invalid message" }, { status: 400 });
    }

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("contact_submissions")
      .insert({
        full_name: fullName,
        email,
        mobile,
        country,
        inquiry_type: inquiryType,
        message,
        locale,
      })
      .select("id")
      .single();

    if (error) {
      console.error("[contact] insert failed:", error.message);
      return NextResponse.json({ error: FORM_ERROR_MESSAGE }, { status: 500 });
    }

    void notifyAdminsOfContactSubmission({
      id: data.id,
      fullName,
      inquiryType,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[contact] unexpected error:", error);
    return NextResponse.json({ error: FORM_ERROR_MESSAGE }, { status: 500 });
  }
}
