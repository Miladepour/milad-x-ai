"use client";

import Link from "next/link";
import { COURSES_BASE_PATH } from "@/lib/courses/constants";
import { useLanguage } from "@/lib/i18n/context";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { TUTORIALS_BASE_PATH } from "@/lib/tutorials/constants";

export default function NotFoundContent() {
  const { href } = useLanguage();
  const t = useTranslation();

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

      <p
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[58%] select-none font-mono text-[clamp(7rem,28vw,16rem)] font-bold leading-none tracking-tighter text-orange/[0.07]"
        aria-hidden
      >
        404
      </p>

      <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-col items-center text-center">
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-orange">
          {t.notFound.label}
        </p>

        <h1 className="mt-5 font-dm text-4xl font-semibold leading-tight text-cream md:text-5xl">
          {t.notFound.title}
        </h1>

        <p className="mt-5 max-w-lg font-dm text-base leading-relaxed text-cream/65 md:text-lg">
          {t.notFound.description}
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={href("/")}
            className="inline-block border-2 border-orange bg-orange px-6 py-3 font-mono text-xs uppercase tracking-widest text-background transition-colors hover:bg-orange-dim hover:border-orange-dim"
          >
            {t.notFound.homeCta}
          </Link>
          <Link
            href={href(COURSES_BASE_PATH)}
            className="inline-block border-2 border-cream px-6 py-3 font-mono text-xs uppercase tracking-widest text-cream transition-colors hover:border-orange hover:text-orange"
          >
            {t.notFound.coursesCta}
          </Link>
        </div>

        <nav
          className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 font-mono text-[11px] uppercase tracking-widest text-cream/45"
          aria-label="Helpful links"
        >
          <Link
            href={href(TUTORIALS_BASE_PATH)}
            className="transition-colors hover:text-orange"
          >
            {t.notFound.tutorialsCta}
          </Link>
          <span aria-hidden className="text-surface">
            /
          </span>
          <Link
            href={href("/contact")}
            className="transition-colors hover:text-orange"
          >
            {t.notFound.contactCta}
          </Link>
        </nav>
      </div>
    </section>
  );
}
