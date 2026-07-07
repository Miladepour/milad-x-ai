import { NextResponse } from "next/server";
import { sendPasswordResetEmail } from "@/lib/email/resend";
import { createStudentPasswordResetLink } from "@/lib/members/store";
import {
  assertPublicFormAllowed,
  clampField,
  FORM_ERROR_MESSAGE,
} from "@/lib/security/forms";
import { clientIpKey, isRateLimited } from "@/lib/security/simple-rate-limit";

const SUCCESS_MESSAGE =
  "Password reset instructions have been sent. Check your inbox and spam folder.";

const NOT_STUDENT_MESSAGE =
  "No student account was found for this email. Check for typos or use the email address from your invite.";

const RATE_LIMIT_MESSAGE = "Too many reset attempts. Please wait a while and try again.";

const MIN_RESPONSE_MS = 600;

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function withMinDelay<T>(fn: () => Promise<T>): Promise<T> {
  const [result] = await Promise.all([
    fn(),
    new Promise<void>((resolve) => {
      setTimeout(resolve, MIN_RESPONSE_MS);
    }),
  ]);
  return result;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    const gate = await assertPublicFormAllowed(body, request);
    if (!gate.ok) {
      return NextResponse.json({ error: FORM_ERROR_MESSAGE }, { status: gate.status });
    }

    const email = clampField(String(body.email ?? ""), 320).toLowerCase();
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const ip = clientIpKey(request);
    if (isRateLimited(`forgot-password:ip:${ip}`) || isRateLimited(`forgot-password:email:${email}`)) {
      return NextResponse.json({ error: RATE_LIMIT_MESSAGE }, { status: 429 });
    }

    const outcome = await withMinDelay(async () => {
      const result = await createStudentPasswordResetLink(email);
      if (!result) return "not_student" as const;

      const sent = await sendPasswordResetEmail({
        to: result.profile.email,
        fullName: result.profile.fullName,
        resetLink: result.resetLink,
        locale: result.profile.locale,
      });

      if (!sent) {
        console.error("[forgot-password] failed to send reset email to", email);
        return "send_failed" as const;
      }

      return "sent" as const;
    });

    if (outcome === "not_student") {
      return NextResponse.json({ error: NOT_STUDENT_MESSAGE }, { status: 404 });
    }

    if (outcome === "send_failed") {
      return NextResponse.json({ error: FORM_ERROR_MESSAGE }, { status: 500 });
    }

    return NextResponse.json({ ok: true, message: SUCCESS_MESSAGE });
  } catch (error) {
    console.error("[forgot-password] unexpected error:", error);
    return NextResponse.json({ error: FORM_ERROR_MESSAGE }, { status: 500 });
  }
}
