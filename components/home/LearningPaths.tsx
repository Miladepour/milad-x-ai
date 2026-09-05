'use client';

import Link from 'next/link';
import { COURSES_BASE_PATH } from '@/lib/courses';
import { useLanguage } from '@/lib/i18n/context';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { PRIVATE_AI_COURSE_BASE_PATH } from '@/lib/private-ai-course/constants';
import { TUTORIALS_BASE_PATH } from '@/lib/tutorials/constants';

export default function LearningPaths() {
  const { lang, href } = useLanguage();
  const t = useTranslation();
  const paths = [COURSES_BASE_PATH, PRIVATE_AI_COURSE_BASE_PATH, TUTORIALS_BASE_PATH];
  const arrow = lang === 'FA' ? '←' : '→';

  return (
    <section
      aria-labelledby="learning-paths-heading"
      className="w-full bg-background px-8 py-20 md:px-12 md:py-24 lg:px-16"
    >
      <div className="mx-auto max-w-6xl">
        <header className="max-w-2xl text-start">
          <span className="home-section-label block font-mono uppercase tracking-[0.35em] text-orange rtl:tracking-normal">
            {t.learningPaths.label}
          </span>
          <h2
            id="learning-paths-heading"
            className="type-course-page-title mt-2 font-dm font-bold leading-tight text-cream"
          >
            {t.learningPaths.heading}
          </h2>
          <p className="type-section-body mt-4 max-w-xl font-dm leading-relaxed text-cream/65">
            {t.learningPaths.description}
          </p>
        </header>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {t.learningPaths.cards.map((card, index) => (
            <article
              key={card.title}
              className="home-course-glass group h-full transition-colors duration-200 hover:border-orange/45 last:sm:col-span-2 last:lg:col-span-1"
            >
              <Link
                href={href(paths[index])}
                className="flex min-h-64 h-full flex-col p-7 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orange sm:p-8"
              >
                <span className="h-px w-10 bg-orange" aria-hidden="true" />
                <h3 className="type-card-title mt-7 font-dm font-semibold text-cream">
                  {card.title}
                </h3>
                <p className="type-card-body mt-4 max-w-[36ch] font-dm leading-relaxed text-cream/65">
                  {card.description}
                </p>
                <span className="mt-auto inline-flex items-center gap-2 pt-8 font-mono text-xs uppercase tracking-wider text-orange transition-colors group-hover:text-cream rtl:tracking-normal">
                  {card.cta}
                  <span aria-hidden="true">{arrow}</span>
                </span>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
