"use client";

import { FormEvent, useState } from "react";
import { Check, Mail, Newspaper } from "lucide-react";
import HoneypotField from "@/components/shared/HoneypotField";
import TurnstileWidget from "@/components/shared/TurnstileWidget";
import { useLanguage } from "@/lib/i18n/context";
import { useTranslation } from "@/lib/i18n/useTranslation";

const turnstileRequired = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim());

export default function FooterNewsletterSignup() {
  const { lang } = useLanguage();
  const t = useTranslation();
  const f = t.footer;

  const [email, setEmail] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (turnstileRequired && !turnstileToken) return;

    setStatus("loading");
    const formData = new FormData(event.currentTarget);
    const website = String(formData.get("website") ?? "");

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          locale: lang,
          website,
          turnstileToken: turnstileToken || undefined,
        }),
      });

      if (!res.ok) throw new Error("subscribe failed");
      setEmail("");
      setTurnstileToken("");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section
      aria-labelledby="footer-newsletter-title"
      className="relative mb-12 overflow-hidden rounded-2xl border border-orange/20 bg-gradient-to-br from-white/[0.09] via-white/[0.04] to-orange/[0.07] p-6 shadow-[0_12px_48px_rgba(0,0,0,0.38)] backdrop-blur-2xl md:p-8 lg:p-10"
    >
      <div
        className="pointer-events-none absolute -end-16 -top-16 h-52 w-52 rounded-full bg-orange/20 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-20 -start-10 h-40 w-40 rounded-full bg-orange/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange/50 to-transparent"
        aria-hidden
      />

      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
        <div className="flex min-w-0 items-start gap-4 md:gap-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-orange/35 bg-orange/15 text-orange shadow-[0_0_28px_rgba(255,106,0,0.22)] md:h-14 md:w-14">
            <Newspaper className="h-6 w-6 md:h-7 md:w-7" strokeWidth={1.75} aria-hidden />
          </div>
          <div className="min-w-0">
            <h2
              id="footer-newsletter-title"
              className="font-dm text-xl font-bold leading-snug text-cream md:text-2xl"
            >
              {f.newsletterTitle}
            </h2>
            <p className="mt-2 max-w-xl font-dm text-sm leading-relaxed text-cream/65 md:text-[15px]">
              {f.newsletterDescription}
            </p>
          </div>
        </div>

        {status === "success" ? (
          <div
            className="flex items-center gap-3 rounded-xl border border-orange/25 bg-orange/[0.1] px-5 py-4 backdrop-blur-sm lg:min-w-[300px]"
            role="status"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange text-background">
              <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden />
            </span>
            <p className="font-dm text-sm font-medium text-cream">{f.newsletterSuccess}</p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex w-full max-w-xl flex-col gap-3 lg:max-w-md lg:shrink-0 xl:max-w-lg"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
              <label className="sr-only" htmlFor="footer-newsletter-email">
                {f.newsletterEmailPlaceholder}
              </label>
              <input
                id="footer-newsletter-email"
                type="email"
                name="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === "error") setStatus("idle");
                }}
                placeholder={f.newsletterEmailPlaceholder}
                className="min-w-0 flex-1 rounded-sm border border-white/15 bg-white/[0.06] px-4 py-3 font-dm text-sm text-cream shadow-inner shadow-black/10 outline-none transition-colors placeholder:text-cream/40 focus:border-orange/50 focus:ring-2 focus:ring-orange/25"
              />
              <button
                type="submit"
                disabled={
                  status === "loading" || (turnstileRequired && !turnstileToken)
                }
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-sm bg-orange px-6 py-3 font-dm text-sm font-semibold text-background shadow-[0_4px_24px_rgba(255,90,0,0.38)] transition-all hover:bg-[#ff7a1a] hover:shadow-[0_6px_28px_rgba(255,90,0,0.45)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Mail className="h-4 w-4" strokeWidth={2.25} aria-hidden />
                {status === "loading" ? f.newsletterSubmitting : f.newsletterSubmit}
              </button>
            </div>

            <HoneypotField />

            {turnstileRequired && (
              <TurnstileWidget
                onToken={setTurnstileToken}
                onExpire={() => setTurnstileToken("")}
              />
            )}

            {status === "error" && (
              <p className="font-dm text-sm text-orange" role="alert">
                {f.newsletterError}
              </p>
            )}
          </form>
        )}
      </div>
    </section>
  );
}
