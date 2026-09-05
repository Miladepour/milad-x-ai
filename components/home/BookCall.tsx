'use client';

import Button from '@/components/ui/Button';
import ConsultationBannerIllustration from '@/components/shared/ConsultationBannerIllustration';
import { CONSULTATION_BASE_PATH } from '@/lib/consultation/constants';
import { COURSES_BASE_PATH } from '@/lib/courses';
import { useLanguage } from '@/lib/i18n/context';
import { useTranslation } from '@/lib/i18n/useTranslation';

export default function BookCall() {
  const { href } = useLanguage();
  const t = useTranslation();
  const cta = t.homeFinalCta;

  return (
    <section
      id="final-cta"
      aria-labelledby="home-final-cta-heading"
      className="bg-background px-8 pb-16 pt-4 md:px-12 md:pb-20 lg:px-16"
    >
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[24px] border border-white/[0.12] bg-surface/65 px-7 py-10 sm:px-10 md:px-12 md:py-12">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange to-transparent"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -end-20 -top-32 h-80 w-80 rounded-full bg-orange/[0.11] blur-3xl"
          aria-hidden="true"
        />

        <div className="relative grid grid-cols-1 items-center gap-8 sm:grid-cols-[minmax(0,1fr)_200px] md:grid-cols-[minmax(0,1fr)_240px] md:gap-12">
          <div className="max-w-2xl text-start">
            <h2
              id="home-final-cta-heading"
              className="type-course-section-heading font-dm font-bold leading-tight text-cream"
            >
              {cta.heading}
            </h2>
            <p className="type-section-body mt-4 max-w-xl font-dm leading-relaxed text-cream/65">
              {cta.sub}
            </p>
            <div className="mt-7 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <Button
                variant="primary"
                size="lg"
                href={href(COURSES_BASE_PATH)}
                className="text-center"
              >
                {cta.primaryCta}
              </Button>
              <Button
                variant="outline"
                size="lg"
                href={href(CONSULTATION_BASE_PATH)}
                className="text-center"
              >
                {cta.secondaryCta}
              </Button>
            </div>
          </div>

          <div className="hidden items-center justify-center sm:flex">
            <ConsultationBannerIllustration />
          </div>
        </div>
      </div>
    </section>
  );
}
