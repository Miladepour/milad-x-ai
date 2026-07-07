"use client";

import { FormEvent, useRef, useState } from "react";
import Link from "next/link";
import { KeyRound } from "lucide-react";
import TurnstileWidget, {
  type TurnstileWidgetHandle,
} from "@/components/shared/TurnstileWidget";
import StudentAuthShell from "@/components/members/StudentAuthShell";
import { accountLoginPath } from "@/lib/members/paths";
import { isTurnstileSiteKeyConfigured } from "@/lib/security/turnstile-client";
import { translations } from "@/lib/i18n/translations";

const turnstileRequired = isTurnstileSiteKeyConfigured();
const t = translations.EN.memberPortal;

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [success, setSuccess] = useState(false);
  const [needsCaptchaRetry, setNeedsCaptchaRetry] = useState(false);
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [honeypot, setHoneypot] = useState("");
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
    setSuccess(false);
    setNeedsCaptchaRetry(false);

    try {
      const res = await fetch("/api/members/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          turnstileToken: captchaToken || undefined,
          website: honeypot,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        message?: string;
        error?: string;
      };

      if (!res.ok) {
        setStatus(data.error ?? t.forgotPasswordError);
        if (turnstileRequired) {
          resetCaptcha();
          setNeedsCaptchaRetry(true);
        }
        setLoading(false);
        return;
      }

      setSuccess(true);
      setStatus(data.message ?? t.forgotPasswordSuccess);
    } catch {
      setStatus(t.forgotPasswordError);
      if (turnstileRequired) {
        resetCaptcha();
        setNeedsCaptchaRetry(true);
      }
    }

    setLoading(false);
  }

  return (
    <StudentAuthShell englishOnly>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div>
          <div className="mb-5 inline-flex h-11 w-11 items-center justify-center border border-orange/40 bg-orange/10">
            <KeyRound className="h-5 w-5 text-orange" strokeWidth={1.75} aria-hidden />
          </div>
          <h1 className="font-dm text-3xl font-semibold tracking-tight text-cream">
            {t.forgotPasswordTitle}
          </h1>
          <p className="mt-2 font-dm text-sm leading-relaxed text-cream/55">
            {t.forgotPasswordSubtitle}
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
              disabled={success}
            />
          </label>
        </div>

        <input
          type="text"
          name="website"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden
        />

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
          disabled={loading || success || (turnstileRequired && !captchaToken)}
          className="w-full bg-orange px-5 py-3.5 font-mono text-xs uppercase tracking-widest text-background transition-colors hover:bg-cream disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? t.forgotPasswordSending : t.forgotPasswordSubmit}
        </button>

        {status && (
          <p
            className={`font-dm text-sm leading-relaxed ${success ? "text-cream/70" : "text-orange"}`}
            role="alert"
          >
            {status}
            {needsCaptchaRetry && turnstileRequired && !captchaToken && !success && (
              <>
                {" "}
                {t.captchaRetryHint}
              </>
            )}
          </p>
        )}

        <p className="border-t border-surface pt-5 font-dm text-xs leading-relaxed text-cream/45">
          <Link href={accountLoginPath()} className="text-orange hover:underline">
            {t.forgotPasswordBackToLogin}
          </Link>
        </p>
      </form>
    </StudentAuthShell>
  );
}
