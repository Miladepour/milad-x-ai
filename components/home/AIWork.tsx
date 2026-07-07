'use client';

import Button from '@/components/ui/Button';
import PortfolioSections from '@/components/portfolio/PortfolioSections';
import { PORTFOLIO_BASE_PATH } from '@/lib/portfolio/constants';
import { portfolioSquareImages } from '@/lib/portfolio/media';
import { useLanguage } from '@/lib/i18n/context';
import { useTranslation } from '@/lib/i18n/useTranslation';

export default function AIWork() {
  const { href } = useLanguage();
  const t = useTranslation();
  const w = t.aiwork;

  return (
    <section
      id="work"
      className="w-full bg-background py-28 px-8 md:px-12 lg:px-16"
    >
      <div className="max-w-6xl mx-auto overflow-hidden px-1">
        <div className="mb-14">
          <span className="type-section-label font-mono text-orange uppercase tracking-[0.35em] rtl:tracking-normal">
            {w.label}
          </span>
          <h2 className="type-course-page-title font-dm font-bold text-cream leading-tight m-0 mt-1">
            {w.heading}
          </h2>
        </div>

        <PortfolioSections
          showApplications={false}
          showImages={portfolioSquareImages.length > 0}
        />

        <div className="flex justify-center mt-12">
          <Button variant="outline" size="lg" href={href(PORTFOLIO_BASE_PATH)}>
            {w.cta}
          </Button>
        </div>
      </div>
    </section>
  );
}
