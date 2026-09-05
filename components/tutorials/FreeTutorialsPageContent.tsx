"use client";

import type { Tutorial } from "@/lib/tutorials/types";
import { TUTORIALS_BASE_PATH } from "@/lib/tutorials/constants";
import { useLanguage } from "@/lib/i18n/context";
import { useTranslation } from "@/lib/i18n/useTranslation";
import PageBreadcrumb from "@/components/layout/PageBreadcrumb";
import PageHero from "@/components/shared/PageHero";
import TutorialExpandableSection from "./TutorialExpandableSection";
import TutorialsGrid from "./TutorialsGrid";
import TutorialsCtaBanner from "./TutorialsCtaBanner";

interface FreeTutorialsPageContentProps {
  tutorials: Tutorial[];
  heroSrc?: string | null;
}

const bodyTextClass =
  "font-dm text-cream/85 leading-relaxed space-y-4 text-sm md:text-base";

export default function FreeTutorialsPageContent({
  tutorials,
  heroSrc,
}: FreeTutorialsPageContentProps) {
  const { href } = useLanguage();
  const t = useTranslation();
  const p = t.tutorialsPage;

  const intro = (
    <>
      <PageBreadcrumb
        ariaLabel={t.navbar.breadcrumbAria}
        variant={heroSrc ? "hero" : "default"}
        className={heroSrc ? "mb-8" : "mb-10"}
        items={[
          { label: t.navbar.home, href: href("/") },
          { label: t.navbar.tutorials, href: href(TUTORIALS_BASE_PATH) },
        ]}
      />

      <p className="type-section-label font-mono text-orange mb-3">{p.label}</p>
      <h1 className="type-course-page-title font-dm font-bold text-cream mb-4 max-w-4xl">
        {p.title}
      </h1>
      <p className="type-section-body font-dm text-cream max-w-2xl mb-4 leading-relaxed">
        {p.introLead}
      </p>
      <p className="type-section-body font-dm text-cream/90 max-w-2xl mb-6 leading-relaxed">
        {p.introNote}
      </p>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-3 max-w-3xl">
        {p.whyFollow.items.map((item) => (
          <li key={item} className="flex gap-3 font-dm text-sm text-cream/85 leading-relaxed">
            <span className="text-orange shrink-0" aria-hidden>
              •
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
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
        {heroSrc ? null : <div className="mb-10">{intro}</div>}

        <TutorialsGrid
          tutorials={tutorials}
          heading={p.tutorialsHeading}
          watchLabel={p.watchTutorial}
          emptyLabel={p.emptyLabel}
          emptyTitle={p.emptyTitle}
          emptyMessage={p.emptyMessage}
        />

        <div className="w-full flex flex-col gap-4">
          <TutorialExpandableSection
            title={p.introMore.title}
            expandLabel={p.expandLabel}
            collapseLabel={p.collapseLabel}
          >
            <div className={bodyTextClass}>
              {p.introMore.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </TutorialExpandableSection>

          <TutorialExpandableSection
            title={p.learningSimple.title}
            expandLabel={p.expandLabel}
            collapseLabel={p.collapseLabel}
          >
            <div className={bodyTextClass}>
              {p.learningSimple.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </TutorialExpandableSection>

          <TutorialsCtaBanner className="mt-2" />
        </div>
      </div>
    </div>
  );
}
