'use client';

import Image from 'next/image';
import { INSTRUCTOR_PORTRAIT_SRC } from '@/lib/instructor/constants';
import { useTranslation } from '@/lib/i18n/useTranslation';

export default function About() {
  const t = useTranslation();

  return (
    <section className="w-full border-t border-white/[0.08] bg-background px-8 py-20 md:px-12 md:py-24 lg:px-16">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-[minmax(260px,0.8fr)_minmax(0,1.2fr)] md:gap-12 lg:gap-16">
          <div className="w-full">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2px] bg-surface md:h-[460px] md:aspect-auto">
              <Image
                src={INSTRUCTOR_PORTRAIT_SRC}
                alt="Milad"
                fill
                sizes="(max-width: 767px) calc(100vw - 4rem), 38vw"
                className="object-cover object-top"
              />
            </div>
          </div>

          <div className="flex flex-col justify-center gap-7 md:border-s md:border-orange/70 md:ps-10 lg:ps-14">
            <div className="flex flex-col gap-3">
              <span className="home-section-label font-mono text-orange uppercase tracking-widest rtl:tracking-normal">
                {t.about.label}
              </span>
              <p className="type-hero-tag font-mono text-orange tracking-[0.2em] rtl:tracking-normal m-0">
                {t.about.identity}
              </p>
              <h2 className="type-course-page-title font-dm font-bold text-cream leading-tight m-0">
                {t.about.heading1}
                <br />
                {t.about.heading2}
              </h2>
            </div>

            <div className="flex max-w-2xl flex-col gap-4">
              {t.about.paragraphs.map((text, i) => (
                <p
                  key={i}
                  className="type-section-body font-dm text-muted leading-relaxed"
                >
                  {text}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
