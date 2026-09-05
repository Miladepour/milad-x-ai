"use client";

import { useState } from "react";
import InstructorAboutSection from "@/components/shared/InstructorAboutSection";
import {
  CONSULTATION_BOOKING_URL,
} from "@/lib/consultation/constants";
import { TELEGRAM_APPLY_URL } from "@/lib/courses/constants";
import { PRIVATE_AI_COURSE_BASE_PATH } from "@/lib/private-ai-course/constants";
import {
  privateCoursePageContent,
  type PrivateCoursePath,
} from "@/lib/private-ai-course/content";
import { useLanguage } from "@/lib/i18n/context";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { toLocaleDigits } from "@/lib/i18n/digits";
import type { Locale } from "@/lib/i18n/translations";
import { cn } from "@/lib/utils";
import PageBreadcrumb from "@/components/layout/PageBreadcrumb";

const btnPrimary =
  "inline-flex items-center justify-center font-mono px-8 py-4 text-sm uppercase tracking-widest rtl:tracking-normal bg-orange text-background border-2 border-orange hover:bg-orange-dim hover:border-orange-dim transition-colors duration-200 rounded-sm";

const btnSecondary =
  "inline-flex items-center justify-center font-mono px-8 py-4 text-sm uppercase tracking-widest rtl:tracking-normal border-2 border-cream/30 text-cream hover:border-orange hover:text-orange transition-colors duration-200 rounded-sm";

function SectionHeading({ children }: { children: string }) {
  return (
    <h2 className="font-mono text-xs text-orange uppercase tracking-widest rtl:tracking-normal mb-6">
      {children}
    </h2>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3 font-dm text-cream/85 leading-relaxed">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span className="text-orange shrink-0" aria-hidden>
            •
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function BookConsultationButton({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <a
      href={CONSULTATION_BOOKING_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(btnPrimary, className)}
    >
      {label}
    </a>
  );
}

function TelegramButton({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <a
      href={TELEGRAM_APPLY_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(btnSecondary, className)}
    >
      {label}
    </a>
  );
}

function PathsAccordion({
  paths,
  lang,
}: {
  paths: PrivateCoursePath[];
  lang: Locale;
}) {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-2">
      {paths.map((path, index) => {
        const isOpen = openIds.has(path.id);
        return (
          <article
            key={path.id}
            id={path.id}
            className={cn(
              "border rounded-sm overflow-hidden transition-colors scroll-mt-28",
              isOpen
                ? "border-orange/40 bg-background/60"
                : "border-surface bg-background/30"
            )}
          >
            <button
              type="button"
              onClick={() => toggle(path.id)}
              className="w-full flex items-center justify-between gap-4 px-4 py-4 text-start hover:bg-surface/40 transition-colors"
              aria-expanded={isOpen}
            >
              <span className="flex items-baseline gap-3 min-w-0">
                <span className="font-mono text-xs text-orange shrink-0">
                  {toLocaleDigits(String(index + 1).padStart(2, "0"), lang)}
                </span>
                <span className="font-dm font-semibold text-cream">
                  {path.title}
                </span>
              </span>
              <span
                className={cn(
                  "text-orange font-mono text-sm shrink-0 transition-transform",
                  isOpen && "rotate-180"
                )}
                aria-hidden
              >
                ▾
              </span>
            </button>
            {isOpen && (
              <div className="px-4 pb-5 border-t border-surface/80">
                <p className="font-dm text-cream/80 leading-relaxed pt-4 mb-6 max-w-3xl">
                  {path.intro}
                </p>
                <h4 className="font-mono text-[10px] text-cream/50 uppercase tracking-widest rtl:tracking-normal mb-3">
                  {path.topicsLabel}
                </h4>
                <div className="mb-6 max-w-3xl">
                  <BulletList items={path.topics} />
                </div>
                <p className="font-mono text-[10px] text-orange uppercase tracking-widest rtl:tracking-normal mb-2">
                  {path.outcomeLabel}
                </p>
                <p className="font-dm text-cream/85 leading-relaxed max-w-3xl">
                  {path.outcome}
                </p>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}

function FaqAccordion({
  items,
}: {
  items: { id: string; question: string; answer: string }[];
}) {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => {
        const isOpen = openIds.has(item.id);
        return (
          <div
            key={item.id}
            className={cn(
              "border rounded-sm overflow-hidden transition-colors",
              isOpen
                ? "border-orange/40 bg-background/60"
                : "border-surface bg-background/30"
            )}
          >
            <button
              type="button"
              onClick={() => toggle(item.id)}
              className="w-full flex items-center justify-between gap-4 px-4 py-3.5 text-start hover:bg-surface/40 transition-colors"
              aria-expanded={isOpen}
            >
              <span className="type-card-body font-dm font-semibold text-cream">
                {item.question}
              </span>
              <span
                className={cn(
                  "text-orange font-mono text-sm shrink-0 transition-transform",
                  isOpen && "rotate-180"
                )}
                aria-hidden
              >
                ▾
              </span>
            </button>
            {isOpen && (
              <div className="px-4 pb-4 border-t border-surface/80">
                <p className="type-card-body font-dm text-cream/90 leading-relaxed pt-3">
                  {item.answer}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function PrivateCoursePageContent() {
  const { href, lang } = useLanguage();
  const t = useTranslation();
  const p = privateCoursePageContent[lang];

  return (
    <div className="flex-1 w-full bg-background text-cream flex flex-col">
      <div className="max-w-6xl mx-auto px-8 md:px-12 lg:px-16 pt-32 pb-24 w-full flex-1">
        <PageBreadcrumb
          ariaLabel={t.navbar.breadcrumbAria}
          className="mb-10"
          items={[
            { label: t.navbar.home, href: href("/") },
            { label: t.navbar.privateCourse, href: href(PRIVATE_AI_COURSE_BASE_PATH) },
          ]}
        />

        {/* Hero */}
        <section className="mb-16 md:mb-20">
          <p className="type-section-label font-mono text-orange mb-3">{p.label}</p>
          <h1 className="type-course-page-title font-dm font-bold text-cream mb-6 max-w-4xl">
            {p.title}
          </h1>
          <p className="type-section-body font-dm text-cream max-w-3xl mb-4 leading-relaxed">
            {p.description}
          </p>
          <p className="type-section-body font-dm text-cream/80 max-w-3xl mb-8 leading-relaxed">
            {p.descriptionSecondary}
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-5">
            <BookConsultationButton label={p.primaryCta} />
            <TelegramButton label={p.telegramCta} />
            <a href="#paths" className={btnSecondary}>
              {p.secondaryCta}
            </a>
          </div>
          <p className="font-dm text-sm text-cream/60 leading-relaxed max-w-2xl">
            {p.pricingNote}
          </p>
        </section>

        {/* Trust strip */}
        <section className="mb-16 md:mb-20 border-y border-surface py-8">
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {p.trustItems.map((item) => (
              <li
                key={item}
                className="font-dm text-sm text-cream/80 flex gap-3 leading-relaxed"
              >
                <span className="text-orange shrink-0" aria-hidden>
                  •
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Instructor */}
        <InstructorAboutSection
          className="mb-16 md:mb-20"
          title={p.instructorSectionTitle}
        />

        {/* Process */}
        <section className="mb-16 md:mb-20">
          <SectionHeading>{p.processTitle}</SectionHeading>
          <ol className="grid gap-10 lg:grid-cols-3">
            {p.processSteps.map((step, index) => (
              <li key={step.title} className="flex flex-col">
                <span className="font-mono text-sm text-orange mb-3">
                  {toLocaleDigits(String(index + 1).padStart(2, "0"), lang)}
                </span>
                <h3 className="font-dm font-semibold text-cream mb-3">
                  {step.title}
                </h3>
                <p className="font-dm text-sm text-cream/80 leading-relaxed mb-4 flex-1">
                  {step.description}
                </p>
                {step.bullets && (
                  <ul className="space-y-2 mb-4">
                    {step.bullets.map((item) => (
                      <li
                        key={item}
                        className="font-dm text-sm text-cream/75 flex gap-2"
                      >
                        <span className="text-orange shrink-0" aria-hidden>
                          •
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {step.cta && (
                  <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                    <BookConsultationButton label={step.cta} />
                    <TelegramButton label={p.telegramCta} />
                  </div>
                )}
              </li>
            ))}
          </ol>
        </section>

        {/* Why private */}
        <section className="mb-16 md:mb-20">
          <SectionHeading>{p.whyTitle}</SectionHeading>
          <p className="font-dm text-cream/85 leading-relaxed max-w-3xl mb-10">
            {p.whyIntro}
          </p>
          <div className="grid gap-8 md:grid-cols-2">
            {p.whyPoints.map((point) => (
              <div key={point.title}>
                <h3 className="font-dm font-semibold text-cream mb-2">
                  {point.title}
                </h3>
                <p className="font-dm text-sm text-cream/75 leading-relaxed">
                  {point.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Learning paths */}
        <section id="paths" className="mb-16 md:mb-20 scroll-mt-28">
          <SectionHeading>{p.pathsTitle}</SectionHeading>
          <p className="font-dm text-cream/85 leading-relaxed max-w-3xl mb-8">
            {p.pathsIntro}
          </p>
          <PathsAccordion paths={p.paths} lang={lang} />

          <div className="mt-10 pt-10 border-t border-surface">
            <h3 className="font-dm font-semibold text-cream mb-3">
              {p.pathsUnsureTitle}
            </h3>
            <p className="font-dm text-cream/80 leading-relaxed max-w-2xl mb-6">
              {p.pathsUnsureBody}
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-4">
              <BookConsultationButton label={p.pathsUnsureCta} />
              <TelegramButton label={p.telegramCta} />
            </div>
          </div>
        </section>

        {/* Audience */}
        <section className="mb-16 md:mb-20">
          <SectionHeading>{p.audienceTitle}</SectionHeading>
          <div className="max-w-3xl">
            <BulletList items={p.audienceItems} />
          </div>
        </section>

        {/* Method */}
        <section className="mb-16 md:mb-20">
          <SectionHeading>{p.methodTitle}</SectionHeading>
          <p className="font-dm text-cream/85 leading-relaxed max-w-3xl mb-8">
            {p.methodIntro}
          </p>
          <ol className="space-y-4 max-w-3xl mb-6">
            {p.methodSteps.map((step, index) => (
              <li key={step} className="flex gap-4 font-dm text-cream/85">
                <span className="font-mono text-sm text-orange shrink-0 w-6">
                  {toLocaleDigits(String(index + 1).padStart(2, "0"), lang)}
                </span>
                <span className="leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
          <p className="font-dm text-sm text-cream/60 leading-relaxed max-w-3xl">
            {p.methodNote}
          </p>
        </section>

        {/* Included */}
        <section className="mb-16 md:mb-20">
          <SectionHeading>{p.includedTitle}</SectionHeading>
          <div className="max-w-3xl">
            <BulletList items={p.includedItems} />
          </div>
        </section>

        {/* Honesty */}
        <section className="mb-16 md:mb-20">
          <SectionHeading>{p.honestyTitle}</SectionHeading>
          <p className="font-dm text-cream/85 leading-relaxed max-w-3xl">
            {p.honestyBody}
          </p>
        </section>

        {/* FAQ */}
        <section id="faq" className="mb-16 md:mb-20 scroll-mt-28">
          <SectionHeading>{p.faqTitle}</SectionHeading>
          <FaqAccordion items={p.faqs} />
        </section>

        {/* Final CTA */}
        <section className="border-t border-surface pt-16">
          <h2 className="type-course-page-title font-dm font-bold text-cream mb-4 max-w-3xl">
            {p.finalTitle}
          </h2>
          <p className="font-dm text-cream/85 leading-relaxed max-w-2xl mb-8">
            {p.finalBody}
          </p>
          <p className="font-mono text-xs text-orange uppercase tracking-widest rtl:tracking-normal mb-3">
            {p.finalPriceLabel}
          </p>
          <ul className="font-dm text-cream/85 space-y-1 mb-4">
            <li>{p.finalPriceOutside}</li>
            {p.finalPriceInside ? <li>{p.finalPriceInside}</li> : null}
          </ul>
          <p className="font-dm text-sm text-cream/60 leading-relaxed max-w-2xl mb-8">
            {p.finalCreditNote}
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap gap-4">
            <BookConsultationButton label={p.finalCta} />
            <TelegramButton label={p.telegramCta} />
          </div>
          <p className="font-dm text-xs text-cream/60 leading-relaxed mt-4">
            {p.finalHint}
          </p>
        </section>
      </div>
    </div>
  );
}
