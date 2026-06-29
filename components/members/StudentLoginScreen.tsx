"use client";

import { FormEvent, useRef, useState } from "react";
import { Lock } from "lucide-react";
import TurnstileWidget, {
  type TurnstileWidgetHandle,
} from "@/components/shared/TurnstileWidget";
import StudentAuthShell from "@/components/members/StudentAuthShell";
import { createClient } from "@/lib/supabase/client";
import { isTurnstileSiteKeyConfigured } from "@/lib/security/turnstile-client";
import { translations } from "@/lib/i18n/translations";
import { useLanguage } from "@/lib/i18n/context";

const turnstileRequired = isTurnstileSiteKeyConfigured();
const t = translations.EN.memberPortal;

interface StudentLoginScreenProps {
  redirectTo: string;
}

export default function StudentLoginScreen({ redirectTo }: StudentLoginScreenProps) {
  const { href } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [needsCaptchaRetry, setNeedsCaptchaRetry] = useState(false);
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const turnstileRef = useRef<TurnstileWidgetHandle>(null);

  function resetCaptcha() {
    setCaptchaToken("");
    turnstileRef.current?.reset();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (turnstileRequired && !captchaToken) {
      setStatus(t.captchaRetryHint);
      setNeedsCaptchaRetry(true);
      return;
    }

    setLoading(true);
    setStatus("");
    setNeedsCaptchaRetry(false);
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
      options: captchaToken ? { captchaToken } : undefined,
    });

    if (error) {
      setStatus(error.message);
      if (turnstileRequired) {
        resetCaptcha();
        setNeedsCaptchaRetry(true);
      }
      setLoading(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setStatus("Sign-in failed.");
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("student_profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile) {
      await supabase.auth.signOut();
      setStatus(
        "This account is not enrolled as a student. Use the link from your invite email."
      );
      resetCaptcha();
      setNeedsCaptchaRetry(true);
      setLoading(false);
      return;
    }

    const bootstrapLocale = redirectTo.startsWith("/fa/") ? "fa" : "en";
    const bootstrapParams = new URLSearchParams({
      locale: bootstrapLocale,
      next: redirectTo,
    });
    window.location.href = `/api/members/device/bootstrap?${bootstrapParams.toString()}`;
  }

  return (
    <StudentAuthShell englishOnly>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div>
          <div className="mb-5 inline-flex h-11 w-11 items-center justify-center border border-orange/40 bg-orange/10">
            <Lock className="h-5 w-5 text-orange" strokeWidth={1.75} aria-hidden />
          </div>
          <h1 className="font-dm text-3xl font-semibold tracking-tight text-cream">
            {t.loginTitle}
          </h1>
          <p className="mt-2 font-dm text-sm leading-relaxed text-cream/55">
            {t.loginSubtitle}
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-cream/45">
              {t.email}
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-field"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-cream/45">
              {t.password}
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-field"
              autoComplete="current-password"
              required
            />
          </label>
        </div>

        <div
          className={
            needsCaptchaRetry && turnstileRequired && !captchaToken
              ? "rounded-xl ring-2 ring-orange/50 ring-offset-2 ring-offset-background"
              : undefined
          }
        >
          <TurnstileWidget
            ref={turnstileRef}
            onToken={(token) => {
              setCaptchaToken(token);
              if (token) setNeedsCaptchaRetry(false);
            }}
            onExpire={() => setCaptchaToken("")}
          />
        </div>

        <button
          type="submit"
          disabled={loading || (turnstileRequired && !captchaToken)}
          className="w-full bg-orange px-5 py-3.5 font-mono text-xs uppercase tracking-widest text-background transition-colors hover:bg-cream disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? t.signingIn : t.signIn}
        </button>

        {status && (
          <p className="font-dm text-sm leading-relaxed text-orange" role="alert">
            {status}
            {needsCaptchaRetry && turnstileRequired && !captchaToken && (
              <>
                {" "}
                {t.captchaRetryHint}
              </>
            )}
          </p>
        )}

        <p className="border-t border-surface pt-5 font-dm text-xs leading-relaxed text-cream/45">
          Invite-only access.{" "}
          <a href={href("/contact")} className="text-orange hover:underline">
            {t.contactSupport}
          </a>
        </p>
      </form>
    </StudentAuthShell>
  );
}
