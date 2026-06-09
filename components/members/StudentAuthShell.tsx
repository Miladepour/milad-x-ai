"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface StudentAuthShellProps {
  children: React.ReactNode;
}

export default function StudentAuthShell({ children }: StudentAuthShellProps) {
  const { href, lang } = useLanguage();
  const t = useTranslation();
  const isFa = lang === "FA";

  return (
    <div className="fixed inset-0 z-[100] flex min-h-screen flex-col bg-background font-dm lg:flex-row">
      {/* Quote panel */}
      <section className="relative flex min-h-[42vh] flex-1 flex-col justify-between overflow-hidden border-b border-surface bg-surface lg:min-h-screen lg:max-w-[52%] lg:border-b-0 lg:border-e lg:border-surface">
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

        <div className="relative z-10 flex items-center justify-between gap-4 p-6 md:p-10 lg:p-12">
          <Link
            href={href("/")}
            className="font-mono text-[11px] uppercase tracking-widest text-cream/50 transition-colors hover:text-orange rtl:tracking-normal"
          >
            ← {t.memberPortal.backToSite}
          </Link>
          <span className="hidden items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-orange sm:inline-flex rtl:tracking-normal">
            <Lock className="h-3 w-3" strokeWidth={2} aria-hidden />
            MX AI Academy
          </span>
        </div>

        <blockquote className="relative z-10 flex flex-1 flex-col justify-center px-6 pb-8 md:px-10 md:pb-10 lg:px-12 lg:pb-16">
          {isFa ? (
            <>
              <p
                lang="fa"
                dir="rtl"
                className="type-auth-quote-fa font-vazir font-semibold leading-snug text-cream"
              >
                {t.memberPortal.loginQuoteFa}
              </p>
              <p
                lang="en"
                className="type-auth-quote-en font-dm mt-8 border-s-2 border-orange/50 ps-5 font-normal italic leading-snug text-orange"
              >
                {t.memberPortal.loginQuoteEn}
              </p>
            </>
          ) : (
            <>
              <p
                lang="en"
                className="type-auth-quote-en font-dm font-bold leading-snug text-cream"
              >
                {t.memberPortal.loginQuoteEn}
              </p>
              <p
                lang="fa"
                dir="rtl"
                className="type-auth-quote-fa font-vazir mt-8 border-s-2 border-orange/50 ps-5 leading-relaxed text-cream/80"
              >
                {t.memberPortal.loginQuoteFa}
              </p>
            </>
          )}
        </blockquote>

        <p className="relative z-10 hidden px-6 pb-8 font-mono text-[10px] uppercase tracking-[0.25em] text-cream/40 lg:block lg:px-12 lg:pb-12 rtl:tracking-normal">
          {isFa ? "پنل دانشجو · فقط با دعوت" : "Student portal · Invite only"}
        </p>
      </section>

      {/* Form panel */}
      <section className="flex flex-1 items-center justify-center px-6 py-10 md:px-12 md:py-14 lg:px-16">
        <div className="w-full max-w-[400px]">{children}</div>
      </section>
    </div>
  );
}
