import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { accountSetPasswordPath } from "@/lib/members/paths";
import { safeRedirectPath } from "@/lib/security/safe-redirect";
import { createClient } from "@/lib/supabase/server";

const INVITE_OTP_TYPES = new Set<EmailOtpType>(["invite", "signup", "magiclink"]);

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = safeRedirectPath(
    searchParams.get("next") ?? accountSetPasswordPath("en")
  );

  const supabase = createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, origin));
    }
  }

  if (tokenHash && type && INVITE_OTP_TYPES.has(type)) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) {
      return NextResponse.redirect(new URL(next, origin));
    }
  }

  return NextResponse.redirect(new URL("/?auth_error=1", origin));
}
