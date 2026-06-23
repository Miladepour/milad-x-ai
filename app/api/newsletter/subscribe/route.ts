import { NextResponse } from "next/server";
import { subscribeNewsletterPublic } from "@/lib/audience/store";
import {
  assertPublicFormAllowed,
  clampField,
  FORM_ERROR_MESSAGE,
} from "@/lib/security/forms";

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

    const email = clampField(String(body.email ?? ""), 320).toLowerCase();
    const locale = body.locale === "FA" ? "FA" : "EN";

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    await subscribeNewsletterPublic({ email, locale });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[newsletter/subscribe] unexpected error:", error);
    return NextResponse.json({ error: FORM_ERROR_MESSAGE }, { status: 500 });
  }
}
