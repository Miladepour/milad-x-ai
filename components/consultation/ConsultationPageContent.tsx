"use client";

import InstructorAboutSection from "@/components/shared/InstructorAboutSection";
import PageBreadcrumb from "@/components/layout/PageBreadcrumb";
import PageHero from "@/components/shared/PageHero";
import { TELEGRAM_APPLY_URL } from "@/lib/courses/constants";
import { useLanguage } from "@/lib/i18n/context";
import { useTranslation } from "@/lib/i18n/useTranslation";
import {
  CONSULTATION_BASE_PATH,
  CONSULTATION_BOOKING_URL,
} from "@/lib/consultation/constants";

const btnPrimary =
  "inline-flex items-center justify-center font-mono px-8 py-4 text-sm uppercase tracking-widest rtl:tracking-normal bg-orange text-background border-2 border-orange hover:bg-orange-dim hover:border-orange-dim transition-colors duration-200 rounded-sm";

const btnSecondary =
  "inline-flex items-center justify-center font-mono px-8 py-4 text-sm uppercase tracking-widest rtl:tracking-normal border-2 border-cream/30 text-cream hover:border-orange hover:text-orange transition-colors duration-200 rounded-sm";

export default function ConsultationPageContent({
  heroSrc,
}: {
  heroSrc?: string | null;
}) {
  const { href } = useLanguage();
  const t = useTranslation();
  const p = t.consultationPage;

  const intro = (
    <>
      <PageBreadcrumb
        ariaLabel={t.navbar.breadcrumbAria}
        variant={heroSrc ? "hero" : "default"}
        className={heroSrc ? "mb-8" : "mb-10"}
        items={[
          { label: t.navbar.home, href: href("/") },
          { label: t.navbar.consultation, href: href(CONSULTATION_BASE_PATH) },
        ]}
      />

      <section className={heroSrc ? undefined : "mb-12"}>
        <p className="type-section-label font-mono text-orange mb-3">{p.label}</p>
        <h1 className="type-course-page-title font-dm font-bold text-cream mb-4 max-w-4xl">
          {p.title}
        </h1>
        <p className="font-mono text-xs text-orange uppercase tracking-widest rtl:tracking-normal mb-6">
          {p.duration}
        </p>
        <p className="type-section-body font-dm text-cream max-w-2xl mb-8 leading-relaxed">
          {p.description}
        </p>
        <p className="font-mono text-xs text-orange uppercase tracking-widest rtl:tracking-normal mb-3">
          {p.priceLabel}
        </p>
        <p className="type-section-body font-dm text-cream/90 max-w-2xl mb-3 leading-relaxed">
          {p.priceNote}
        </p>
        <p className="font-dm text-sm text-cream/70 max-w-2xl mb-8 leading-relaxed">
          {p.iranTelegramHint}
        </p>
        <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-5">
          <a
            href={CONSULTATION_BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={btnPrimary}
          >
            {p.bookCta}
          </a>
          <a
            href={TELEGRAM_APPLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={btnSecondary}
          >
            {p.telegramCta}
          </a>
        </div>
        <p className="font-dm text-xs text-cream/60 leading-relaxed max-w-2xl">
          {p.bookHint}
        </p>
      </section>
    </>
  );

  return (
    <div className="flex-1 w-full bg-background text-cream flex flex-col">
      {heroSrc ? <PageHero src={heroSrc} alt={p.title}>{intro}</PageHero> : null}

      <div
        className={
          heroSrc
            ? "max-w-6xl mx-auto px-8 md:px-12 lg:px-16 pt-12 md:pt-16 pb-24 w-full flex-1"
            : "max-w-6xl mx-auto px-8 md:px-12 lg:px-16 pt-32 pb-24 w-full flex-1"
        }
      >
        {heroSrc ? null : intro}

        <section>
          <h2 className="font-mono text-xs text-orange uppercase tracking-widest rtl:tracking-normal mb-4">
            {p.whatWeCover}
          </h2>
          <ul className="space-y-3 font-dm text-cream/85 leading-relaxed max-w-2xl">
            {p.bullets.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="text-orange shrink-0" aria-hidden>
                  •
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <InstructorAboutSection className="mt-16 pt-16" />
      </div>
    </div>
  );
}
