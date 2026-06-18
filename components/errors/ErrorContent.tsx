"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/context";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { learnPath, learnSupportPath } from "@/lib/members/paths";

type ErrorContentProps = {
  onRetry?: () => void;
  variant?: "site" | "learn";
};

export default function ErrorContent({ onRetry, variant = "site" }: ErrorContentProps) {
  const { href, urlLocale } = useLanguage();
  const t = useTranslation();
  const copy = t.errorPage;

  return (
    <section className="relative flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center overflow-hidden px-6 py-28 md:px-12">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 110%, rgba(255,92,0,0.22) 0%, transparent 65%)",
        }}
      />

      <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-col items-center text-center">
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-orange">
          {copy.errorLabel}
        </p>

        <h1 className="mt-5 font-dm text-4xl font-semibold leading-tight text-cream md:text-5xl">
          {copy.errorTitle}
        </h1>

        <p className="mt-5 max-w-lg font-dm text-base leading-relaxed text-cream/65 md:text-lg">
          {copy.errorDescription}
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          {onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="inline-block border-2 border-orange bg-orange px-6 py-3 font-mono text-xs uppercase tracking-widest text-background transition-colors hover:bg-orange-dim hover:border-orange-dim"
            >
              {copy.errorRetryCta}
            </button>
          ) : null}
          {variant === "learn" ? (
            <Link
              href={learnPath(urlLocale)}
              className="inline-block border-2 border-cream px-6 py-3 font-mono text-xs uppercase tracking-widest text-cream transition-colors hover:border-orange hover:text-orange"
            >
              {t.memberPortal.backToDashboard}
            </Link>
          ) : (
            <Link
              href={href("/")}
              className="inline-block border-2 border-cream px-6 py-3 font-mono text-xs uppercase tracking-widest text-cream transition-colors hover:border-orange hover:text-orange"
            >
              {t.notFound.homeCta}
            </Link>
          )}
          {variant === "learn" ? (
            <Link
              href={learnSupportPath(urlLocale)}
              className="inline-block border-2 border-cream/40 px-6 py-3 font-mono text-xs uppercase tracking-widest text-cream/80 transition-colors hover:border-orange hover:text-orange"
            >
              {copy.errorSupportCta}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
