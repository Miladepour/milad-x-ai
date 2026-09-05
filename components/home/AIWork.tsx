'use client';

import Button from '@/components/ui/Button';
import PortfolioSections from '@/components/portfolio/PortfolioSections';
import { PORTFOLIO_BASE_PATH } from '@/lib/portfolio/constants';
import { portfolioReels, portfolioSquareImages } from '@/lib/portfolio/media';
import { useLanguage } from '@/lib/i18n/context';
import { useTranslation } from '@/lib/i18n/useTranslation';

const HOME_REEL_IDS = new Set([
  'ai-video-showcase',
  'danlee-pharma-device-ad',
  'ugc-with-ai-jb-design-london',
]);

const HOME_IMAGE_IDS = new Set([
  'ai-by-milad-01',
  'ai-by-milad-10',
  'ai-by-milad-13',
]);

const homeReels = portfolioReels.filter((item) => HOME_REEL_IDS.has(item.id));
const homeImages = portfolioSquareImages.filter((item) => HOME_IMAGE_IDS.has(item.id));

export default function AIWork() {
  const { href } = useLanguage();
  const t = useTranslation();
  const w = t.aiwork;

  return (
    <section
      id="work"
      className="w-full bg-background pt-14 pb-10 md:pb-12 px-8 md:px-12 lg:px-16"
    >
      <div className="max-w-6xl mx-auto px-1">
        <div className="mb-14">
          <span className="home-section-label font-mono text-orange uppercase tracking-[0.35em] rtl:tracking-normal">
            {w.label}
          </span>
          <h2 className="type-course-page-title font-dm font-bold text-cream leading-tight m-0 mt-1">
            {w.heading}
          </h2>
        </div>

        <PortfolioSections
          showApplications={false}
          showImages={homeImages.length > 0}
          reels={homeReels}
          images={homeImages}
          headingLevel="h3"
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
