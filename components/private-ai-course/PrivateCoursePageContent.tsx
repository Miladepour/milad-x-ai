"use client";

import { useEffect, useRef, useState } from "react";
import {
  Briefcase,
  Check,
  CheckCircle2,
  ChevronDown,
  Disc,
  FolderKanban,
  Gauge,
  Infinity as InfinityIcon,
  ListChecks,
  MessageCircle,
  Target,
  Users,
  Video,
  type LucideIcon,
} from "lucide-react";
import InstructorAboutSection from "@/components/shared/InstructorAboutSection";
import { CONSULTATION_BOOKING_URL } from "@/lib/consultation/constants";
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
import PageHero from "@/components/shared/PageHero";

const TRUST_ICONS: LucideIcon[] = [
  Users,
  ListChecks,
  FolderKanban,
  Video,
  Disc,
  InfinityIcon,
];

const WHY_ICONS: LucideIcon[] = [
  Target,
  Briefcase,
  Gauge,
  MessageCircle,
  CheckCircle2,
];

const btnPrimary =
  "inline-flex items-center justify-center font-mono px-8 py-4 text-sm uppercase tracking-widest rtl:tracking-normal bg-orange text-background border-2 border-orange hover:bg-orange-dim hover:border-orange-dim transition-colors duration-200 rounded-sm";

const btnSecondary =
  "inline-flex items-center justify-center font-mono px-8 py-4 text-sm uppercase tracking-widest rtl:tracking-normal border-2 border-cream/30 text-cream hover:border-orange hover:text-orange transition-colors duration-200 rounded-sm";

const btnStickyPrimary =
  "flex-[1.35] inline-flex items-center justify-center font-mono px-3 py-3 text-[11px] uppercase tracking-widest rtl:tracking-normal bg-orange text-background border-2 border-orange rounded-sm";

const btnStickySecondary =
  "flex-1 inline-flex items-center justify-center font-mono px-3 py-3 text-[11px] uppercase tracking-widest rtl:tracking-normal border-2 border-cream/30 text-cream rounded-sm";

function SectionHeading({ children }: { children: string }) {
  return (
    <h2 className="font-mono text-xs text-orange uppercase tracking-widest rtl:tracking-normal mb-6 text-start">
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
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-orange shrink-0 transition-transform",
                  isOpen && "rotate-180"
                )}
                strokeWidth={1.75}
                aria-hidden
              />
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
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-orange shrink-0 transition-transform",
                  isOpen && "rotate-180"
                )}
                strokeWidth={1.75}
                aria-hidden
              />
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

function StickyCtaBar({
  bookLabel,
  telegramLabel,
  visible,
}: {
  bookLabel: string;
  telegramLabel: string;
  visible: boolean;
}) {
  return (
    <div
      className={cn(
        "lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-surface bg-background/95 backdrop-blur-md transition-transform duration-200",
        "pt-3 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]",
        visible ? "translate-y-0" : "translate-y-full pointer-events-none"
      )}
      aria-hidden={!visible}
    >
      <div className="flex gap-2 max-w-lg mx-auto">
        <a
          href={CONSULTATION_BOOKING_URL}
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={visible ? 0 : -1}
          className={btnStickyPrimary}
        >
          {bookLabel}
        </a>
        <a
          href={TELEGRAM_APPLY_URL}
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={visible ? 0 : -1}
          className={btnStickySecondary}
        >
          {telegramLabel}
        </a>
      </div>
    </div>
  );
}

export default function PrivateCoursePageContent({
  heroSrc,
}: {
  heroSrc?: string | null;
}) {
  const { href, lang } = useLanguage();
  const t = useTranslation();
  const p = privateCoursePageContent[lang];
  const heroCtaRef = useRef<HTMLDivElement>(null);
  const finalRef = useRef<HTMLElement>(null);
  const [showSticky, setShowSticky] = useState(false);

  useEffect(() => {
    const hero = heroCtaRef.current;
    const final = finalRef.current;
    if (!hero || !final) return;

    let heroVisible = true;
    let finalVisible = false;

    const update = () => {
      setShowSticky(!heroVisible && !finalVisible);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.target === hero) heroVisible = entry.isIntersecting;
          if (entry.target === final) finalVisible = entry.isIntersecting;
        }
        update();
      },
      { threshold: 0.12 }
    );

    observer.observe(hero);
    observer.observe(final);
    return () => observer.disconnect();
  }, []);

  const jumpLinks = [
    { href: "#process", label: p.jumpNavProcess },
    { href: "#paths", label: p.jumpNavPaths },
    { href: "#included", label: p.jumpNavIncluded },
    { href: "#faq", label: p.jumpNavFaq },
  ];

  const intro = (
    <>
      <PageBreadcrumb
        ariaLabel={t.navbar.breadcrumbAria}
        variant={heroSrc ? "hero" : "default"}
        className={heroSrc ? "mb-8" : "mb-10"}
        items={[
          { label: t.navbar.home, href: href("/") },
          { label: t.navbar.privateCourse, href: href(PRIVATE_AI_COURSE_BASE_PATH) },
        ]}
      />

      <section className={heroSrc ? undefined : "mb-10 md:mb-12"}>
        <p className="type-section-label font-mono text-orange mb-3">{p.label}</p>
        <h1 className="type-course-page-title font-dm font-bold text-cream mb-5 max-w-4xl">
          {p.title}
        </h1>
        <p className="type-section-body font-dm text-cream max-w-3xl mb-4 leading-relaxed">
          {p.description}
        </p>
        <p className="type-section-body font-dm text-cream/80 max-w-3xl mb-7 leading-relaxed">
          {p.descriptionSecondary}
        </p>
        <div ref={heroCtaRef} className="flex flex-col sm:flex-row flex-wrap gap-4">
          <BookConsultationButton label={p.primaryCta} />
          <TelegramButton label={p.telegramCta} />
        </div>
      </section>
    </>
  );

  return (
    <div className="flex-1 w-full bg-background text-cream flex flex-col">
      {heroSrc ? <PageHero src={heroSrc} alt={p.title}>{intro}</PageHero> : null}

      <div
        className={
          heroSrc
            ? "max-w-6xl mx-auto px-8 md:px-12 lg:px-16 pt-10 md:pt-16 pb-28 lg:pb-24 w-full flex-1"
            : "max-w-6xl mx-auto px-8 md:px-12 lg:px-16 pt-32 pb-28 lg:pb-24 w-full flex-1"
        }
      >
        {heroSrc ? null : intro}

        <nav aria-label={p.jumpNavAria} className="mb-8 md:mb-10">
          <ul className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            {jumpLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="flex items-center justify-center sm:inline-flex font-dm text-sm whitespace-nowrap px-3.5 py-2 rounded-sm text-orange border border-surface hover:text-cream hover:border-orange/40 hover:bg-surface/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/60 transition-colors w-full sm:w-auto"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <p className="font-dm text-sm text-cream/60 leading-relaxed max-w-2xl mb-10 md:mb-12">
          {p.pricingNote}
        </p>

        <section className="mb-16 md:mb-20 border-y border-surface py-8">
          <ul className="grid grid-cols-2 gap-x-4 gap-y-6 lg:grid-cols-3">
            {p.trustItems.map((item, index) => {
              const Icon = TRUST_ICONS[index] ?? Check;
              return (
                <li
                  key={item}
                  className="font-dm text-sm text-cream/85 flex gap-3 leading-snug"
                >
                  <Icon
                    className="mt-0.5 h-4 w-4 shrink-0 text-orange"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                  <span>{item}</span>
                </li>
              );
            })}
          </ul>
        </section>

        <section id="process" className="mb-16 md:mb-20 scroll-mt-28">
          <SectionHeading>{p.processTitle}</SectionHeading>
          <ol className="lg:grid lg:grid-cols-3 lg:gap-10">
            {p.processSteps.map((step, index) => (
              <li
                key={step.title}
                className="relative flex gap-4 lg:flex-col lg:gap-0 pb-10 last:pb-0 lg:pb-0"
              >
                <div className="flex flex-col items-center lg:items-start shrink-0">
                  <span className="font-mono text-sm text-orange leading-none">
                    {toLocaleDigits(String(index + 1).padStart(2, "0"), lang)}
                  </span>
                  {index < p.processSteps.length - 1 ? (
                    <span
                      className="mt-3 w-px flex-1 min-h-[1.5rem] bg-orange/25 lg:hidden"
                      aria-hidden
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1 lg:mt-3">
                  <h3 className="font-dm font-semibold text-cream mb-3">
                    {step.title}
                  </h3>
                  <p className="font-dm text-sm text-cream/80 leading-relaxed mb-4">
                    {step.description}
                  </p>
                  {step.bullets ? (
                    <ul className="space-y-2">
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
                  ) : null}
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-12 pt-10 border-t border-surface">
            <h3 className="font-dm font-semibold text-cream mb-3">
              {p.methodTitle}
            </h3>
            <p className="font-dm text-cream/80 leading-relaxed max-w-3xl mb-6">
              {p.methodIntro}
            </p>
            <ol className="space-y-3 max-w-3xl mb-5">
              {p.methodSteps.map((step, index) => (
                <li key={step} className="flex gap-3 font-dm text-sm text-cream/85">
                  <span className="font-mono text-xs text-orange shrink-0 w-6 pt-0.5">
                    {toLocaleDigits(String(index + 1).padStart(2, "0"), lang)}
                  </span>
                  <span className="leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
            <p className="font-dm text-sm text-cream/60 leading-relaxed max-w-3xl">
              {p.methodNote}
            </p>
          </div>
        </section>

        <InstructorAboutSection
          className="mb-16 md:mb-20"
          title={p.instructorSectionTitle}
        />

        <section id="paths" className="mb-16 md:mb-20 scroll-mt-28">
          <SectionHeading>{p.pathsTitle}</SectionHeading>
          <p className="font-dm text-cream/85 leading-relaxed max-w-3xl mb-8">
            {p.pathsIntro}
          </p>
          <PathsAccordion paths={p.paths} lang={lang} />

          <div className="mt-8 pt-8 border-t border-surface">
            <h3 className="font-dm font-semibold text-cream mb-3">
              {p.pathsUnsureTitle}
            </h3>
            <p className="font-dm text-cream/80 leading-relaxed max-w-2xl mb-4">
              {p.pathsUnsureBody}
            </p>
            <a
              href="#book"
              className="font-mono text-xs text-orange uppercase tracking-widest rtl:tracking-normal hover:text-cream transition-colors"
            >
              {p.pathsUnsureCta}
            </a>
          </div>
        </section>

        <section
          id="included"
          className="mb-16 md:mb-20 scroll-mt-28 rounded-sm bg-surface/30 border border-surface px-5 py-8 md:px-8 md:py-10"
        >
          <SectionHeading>{p.whyTitle}</SectionHeading>
          <p className="font-dm text-cream/85 leading-relaxed max-w-3xl mb-8">
            {p.whyIntro}
          </p>
          <ul className="grid gap-5 mb-12">
            {p.whyPoints.map((point, index) => {
              const Icon = WHY_ICONS[index] ?? Target;
              return (
                <li key={point.title} className="flex items-start gap-3">
                  <Icon
                    className="mt-0.5 h-4 w-4 shrink-0 text-orange"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                  <div className="min-w-0">
                    <h3 className="font-dm font-semibold text-cream mb-1">
                      {point.title}
                    </h3>
                    <p className="font-dm text-sm text-cream/75 leading-relaxed">
                      {point.description}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="flex flex-col gap-10 pt-8 border-t border-surface">
            <div>
              <h3 className="font-mono text-xs text-orange uppercase tracking-widest rtl:tracking-normal mb-4 text-start">
                {p.audienceTitle}
              </h3>
              <ul className="space-y-2.5">
                {p.audienceItems.map((item) => (
                  <li
                    key={item}
                    className="font-dm text-sm text-cream/85 flex items-start gap-2.5 leading-snug text-start"
                  >
                    <Check
                      className="mt-0.5 h-4 w-4 shrink-0 text-orange"
                      strokeWidth={1.75}
                      aria-hidden
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-mono text-xs text-orange uppercase tracking-widest rtl:tracking-normal mb-4 text-start">
                {p.includedTitle}
              </h3>
              <ul className="space-y-2.5">
                {p.includedItems.map((item) => (
                  <li
                    key={item}
                    className="font-dm text-sm text-cream/85 flex items-start gap-2.5 leading-snug text-start"
                  >
                    <Check
                      className="mt-0.5 h-4 w-4 shrink-0 text-orange"
                      strokeWidth={1.75}
                      aria-hidden
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-16 md:mb-20 rounded-sm bg-surface/30 border border-surface px-5 py-8 md:px-8 md:py-10">
          <SectionHeading>{p.honestyTitle}</SectionHeading>
          <p className="font-dm text-cream/85 leading-relaxed max-w-3xl text-start">
            {p.honestyBody}
          </p>
        </section>

        <section id="faq" className="mb-16 md:mb-20 scroll-mt-28">
          <SectionHeading>{p.faqTitle}</SectionHeading>
          <FaqAccordion items={p.faqs} />
        </section>

        <section
          id="book"
          ref={finalRef}
          className="rounded-sm bg-surface/40 border border-surface px-5 py-10 md:px-10 md:py-14"
        >
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

      <StickyCtaBar
        bookLabel={p.stickyBookCta}
        telegramLabel={p.stickyTelegramCta}
        visible={showSticky}
      />
    </div>
  );
}
