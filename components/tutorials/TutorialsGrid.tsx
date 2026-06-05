"use client";

import Link from "next/link";
import type { Tutorial } from "@/lib/tutorials/types";
import { TUTORIALS_BASE_PATH } from "@/lib/tutorials/constants";
import { useLanguage } from "@/lib/i18n/context";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { toLocaleDigits } from "@/lib/i18n/digits";
import TutorialCardCover from "./TutorialCardCover";

interface TutorialsGridProps {
  tutorials: Tutorial[];
  heading: string;
  watchLabel: string;
  emptyLabel: string;
  emptyTitle: string;
  emptyMessage: string;
}

export default function TutorialsGrid({
  tutorials,
  heading,
  watchLabel,
  emptyLabel,
  emptyTitle,
  emptyMessage,
}: TutorialsGridProps) {
  const { lang, href } = useLanguage();
  const t = useTranslation();
  const freeBadge = t.tutorialsPage.freeBadge;

  return (
    <section className="mb-10 md:mb-12">
      <h2 className="font-mono text-xs text-orange uppercase tracking-widest rtl:tracking-normal mb-5">
        {heading}
      </h2>

      {tutorials.length === 0 ? (
        <div className="border border-surface rounded-[30px] bg-surface/20 px-8 py-14 md:py-16 text-center">
          <p className="font-mono text-xs text-orange uppercase tracking-widest rtl:tracking-normal mb-4">
            {emptyLabel}
          </p>
          <h3 className="type-course-section-heading font-dm font-bold text-cream mb-3">
            {emptyTitle}
          </h3>
          <p className="type-section-body font-dm text-cream/80 max-w-md mx-auto leading-relaxed">
            {emptyMessage}
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
          {tutorials.map((tutorial) => (
            <li key={tutorial.slug}>
              <Link
                href={href(`${TUTORIALS_BASE_PATH}/${tutorial.slug}`)}
                className="group block border border-surface rounded-[30px] bg-surface/30 overflow-hidden hover:border-orange/40 transition-colors h-full"
              >
                <TutorialCardCover
                  title={tutorial.title}
                  freeLabel={freeBadge}
                />
                <div className="p-3 sm:p-3 md:p-3.5">
                  <time className="font-mono text-[11px] sm:text-xs text-orange">
                    {toLocaleDigits(tutorial.date, lang)}
                  </time>
                  <p className="font-dm text-[11px] sm:text-xs md:text-[11px] lg:text-[10px] font-normal text-cream/65 line-clamp-3 leading-snug mt-1.5">
                    {tutorial.excerpt}
                  </p>
                  <span className="inline-block mt-1.5 font-mono text-[10px] sm:text-xs text-orange group-hover:text-cream transition-colors">
                    {watchLabel}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
