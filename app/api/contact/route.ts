import { NextResponse } from "next/server";
import { getCountryName } from "@/lib/countries";
import type { ContactInquiryType } from "@/lib/contact/types";
import { createAnonClient } from "@/lib/supabase/server";

const VALID_INQUIRY_TYPES: ContactInquiryType[] = ["private_course", "collaboration"];

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const fullName = String(body.fullName ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const mobile = String(body.mobile ?? "").trim();
    const country = String(body.country ?? "").trim();
    const inquiryType = String(body.inquiryType ?? "").trim() as ContactInquiryType;
    const message = String(body.message ?? "").trim();
    const locale = String(body.locale ?? "EN").trim();

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

    const supabase = createAnonClient();
    const { error } = await supabase.from("contact_submissions").insert({
      full_name: fullName,
      email,
      mobile,
      country,
      inquiry_type: inquiryType,
      message,
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
