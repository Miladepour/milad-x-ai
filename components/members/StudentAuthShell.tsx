"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { useEffect } from "react";
import { useLanguage } from "@/lib/i18n/context";
import { translations } from "@/lib/i18n/translations";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface StudentAuthShellProps {
  children: React.ReactNode;
  /** Login and set-password form copy stays English when true. Quotes always show in EN + FA. */
  englishOnly?: boolean;
}

export default function StudentAuthShell({
  children,
  englishOnly = false,
}: StudentAuthShellProps) {
  const { href, lang } = useLanguage();
  const localeT = useTranslation();
  const t = englishOnly ? translations.EN : localeT;

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto overscroll-y-contain bg-background font-dm">
      <div className="flex min-h-[100dvh] flex-col lg:min-h-0 lg:flex-row">
        <section className="relative flex shrink-0 flex-col overflow-hidden border-b border-surface bg-surface lg:min-h-[100dvh] lg:max-w-[52%] lg:flex-1 lg:border-b-0 lg:border-e">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 80% 70% at 20% 100%, rgba(255,92,0,0.22) 0%, transparent 65%), radial-gradient(ellipse 50% 40% at 90% 10%, rgba(255,92,0,0.08) 0%, transparent 55%)",
            }}
          />
          <div
            className="pointer-events-none absolute -end-24 top-1/3 h-64 w-64 rounded-full bg-orange/10 blur-3xl"
            aria-hidden
          />

          <div className="relative z-10 flex items-center justify-between gap-4 px-6 pb-4 pt-[max(1rem,env(safe-area-inset-top))] md:px-10 md:pb-6 lg:p-12">
            <Link
              href={href("/")}
              className="font-mono text-[11px] uppercase tracking-widest text-cream/50 transition-colors hover:text-orange"
            >
              ← {t.memberPortal.backToSite}
            </Link>
            <span className="hidden items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-orange sm:inline-flex">
              <Lock className="h-3 w-3" strokeWidth={2} aria-hidden />
              MX AI Academy
            </span>
          </div>

          <blockquote className="relative z-10 flex flex-col justify-center px-6 pb-8 md:px-10 lg:flex-1 lg:px-12 lg:pb-16">
            <p
              lang="en"
              dir="ltr"
              className="type-auth-quote-en font-dm font-bold text-cream"
            >
              {translations.EN.memberPortal.loginQuoteEn}
            </p>
            <p
              lang="fa"
              dir="rtl"
              className="type-auth-quote-fa mt-5 border-s-2 border-orange/50 ps-4 font-vazir text-cream/85 sm:mt-6 sm:ps-5"
            >
              {translations.FA.memberPortal.loginQuoteFa}
            </p>
          </blockquote>

          <p className="relative z-10 px-6 pb-8 font-mono text-[10px] uppercase tracking-[0.25em] text-cream/40 lg:px-12 lg:pb-12">
            {lang === "FA" ? "پنل دانشجو · فقط با دعوت" : "Student portal · Invite only"}
          </p>
        </section>

        <section className="flex shrink-0 justify-center px-6 py-8 pb-[max(2rem,env(safe-area-inset-bottom))] md:px-12 md:py-10 lg:min-h-[100dvh] lg:flex-1 lg:items-center lg:px-16 lg:py-14">
          <div className="w-full max-w-[400px]">{children}</div>
        </section>
      </div>
    </div>
  );
}
