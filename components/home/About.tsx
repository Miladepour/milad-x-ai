'use client';

import Image from 'next/image';
import { useTranslation } from '@/lib/i18n/useTranslation';

export default function About() {
  const t = useTranslation();

  return (
    <section className="w-full bg-background py-28 px-8 md:px-12 lg:px-16">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-stretch gap-0">
          <div className="w-full md:w-[42%] flex-shrink-0">
            <div
              className="w-full bg-surface overflow-hidden"
              style={{ borderRadius: '2px', height: '520px', position: 'relative' }}
            >
              <Image
                src="/images/about-me-milad.jpeg"
                alt="Milad"
                fill
                sizes="(max-width: 768px) 100vw, 42vw"
                className="object-cover object-top"
              />
            </div>
          </div>

          <div className="hidden md:block w-px bg-orange mx-10 flex-shrink-0" />

          <div className="flex flex-col justify-center gap-7 flex-1 mt-12 md:mt-0">
            <div className="flex flex-col gap-3">
              <span className="type-section-label font-mono text-orange uppercase tracking-widest rtl:tracking-normal">
                {t.about.label}
              </span>
              <h2 className="type-course-page-title font-dm font-bold text-cream leading-tight m-0">
                {t.about.heading1}
                <br />
                {t.about.heading2}
              </h2>
            </div>

            <div className="flex flex-col gap-5">
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
