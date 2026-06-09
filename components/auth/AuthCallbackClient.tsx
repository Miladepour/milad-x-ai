"use client";

import { useEffect, useState } from "react";
import type { EmailOtpType } from "@supabase/supabase-js";
import { accountSetPasswordPath } from "@/lib/members/paths";
import { safeRedirectPath } from "@/lib/security/safe-redirect";
import { createClient } from "@/lib/supabase/client";

const OTP_TYPES = new Set<EmailOtpType>([
  "invite",
  "signup",
  "magiclink",
  "recovery",
  "email",
]);

function readNextPath(): string {
  const params = new URLSearchParams(window.location.search);
  return safeRedirectPath(
    params.get("next") ?? accountSetPasswordPath("en")
  );
}

export default function AuthCallbackClient() {
  const [message, setMessage] = useState("Signing you in…");

  useEffect(() => {
    let cancelled = false;

    async function finishAuth(): Promise<boolean> {
      const supabase = createClient();
      const next = readNextPath();

      const code = new URLSearchParams(window.location.search).get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
          window.location.replace(next);
          return true;
        }
      }

      const tokenHash = new URLSearchParams(window.location.search).get(
        "token_hash"
      );
      const type = new URLSearchParams(window.location.search).get(
        "type"
      ) as EmailOtpType | null;
      if (tokenHash && type && OTP_TYPES.has(type)) {
        const { error } = await supabase.auth.verifyOtp({
          type,
          token_hash: tokenHash,
        });
        if (!error) {
          window.location.replace(next);
          return true;
        }
      }

      const hash = window.location.hash.replace(/^#/, "");
      if (hash) {
        const hashParams = new URLSearchParams(hash);
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (!error) {
            window.location.replace(next);
            return true;
          }
        }
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        window.location.replace(next);
        return true;
      }

      return false;
    }

    async function run() {
      const ok = await finishAuth();
      if (cancelled) return;

      if (!ok) {
        setMessage("Could not verify your link. It may have expired.");
        window.setTimeout(() => {
          window.location.replace("/?auth_error=1");
        }, 2500);
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-6">
      <p className="font-dm text-sm text-cream/70">{message}</p>
    </div>
  );
}
