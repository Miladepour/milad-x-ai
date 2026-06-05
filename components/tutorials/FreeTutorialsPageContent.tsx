"use client";

import Link from "next/link";
import type { Tutorial } from "@/lib/tutorials/types";
import { useLanguage } from "@/lib/i18n/context";
import { useTranslation } from "@/lib/i18n/useTranslation";
import TutorialExpandableSection from "./TutorialExpandableSection";
import TutorialsGrid from "./TutorialsGrid";
import TutorialsCtaBanner from "./TutorialsCtaBanner";

interface FreeTutorialsPageContentProps {
  tutorials: Tutorial[];
}

const bodyTextClass =
  "font-dm text-cream/85 leading-relaxed space-y-4 text-sm md:text-base";

export default function FreeTutorialsPageContent({
  tutorials,
}: FreeTutorialsPageContentProps) {
  const { href } = useLanguage();
  const t = useTranslation();
  const p = t.tutorialsPage;

  return (
    <div className="flex-1 w-full bg-background text-cream flex flex-col">
      <div className="max-w-6xl mx-auto px-8 md:px-12 lg:px-16 pt-32 pb-24 w-full flex-1">
        <Link
          href={href("/")}
          className="font-dm text-sm text-muted hover:text-cream transition-colors mb-10 inline-block"
        >
          {p.backHome}
        </Link>

        <header className="max-w-3xl mb-8 md:mb-10">
          <p className="type-section-label font-mono text-orange mb-3">
            {p.label}
          </p>
          <h1 className="type-course-page-title font-dm font-bold text-cream mb-4">
            {p.title}
          </h1>
          <p className="type-section-body font-dm text-cream leading-relaxed">
            {p.introLead}
          </p>
        </header>

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
            title={p.whyFollow.title}
            expandLabel={p.expandLabel}
            collapseLabel={p.collapseLabel}
          >
            <ul className="font-dm text-cream/85 leading-relaxed space-y-3 text-sm md:text-base">
              {p.whyFollow.items.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="text-orange shrink-0 mt-0.5" aria-hidden>
                    •
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
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
