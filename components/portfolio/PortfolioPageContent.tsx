"use client";

import PortfolioSections from "@/components/portfolio/PortfolioSections";
import ConsultationCtaBanner from "@/components/shared/ConsultationCtaBanner";
import PageBreadcrumb from "@/components/layout/PageBreadcrumb";
import PageHero from "@/components/shared/PageHero";
import { PORTFOLIO_BASE_PATH } from "@/lib/portfolio/constants";
import { useLanguage } from "@/lib/i18n/context";
import { useTranslation } from "@/lib/i18n/useTranslation";

export default function PortfolioPageContent({
  heroSrc,
}: {
  heroSrc?: string | null;
}) {
  const { href } = useLanguage();
  const t = useTranslation();
  const p = t.portfolioPage;

  const intro = (
    <>
      <PageBreadcrumb
        ariaLabel={t.navbar.breadcrumbAria}
        variant={heroSrc ? "hero" : "default"}
        className={heroSrc ? "mb-8" : "mb-10"}
        items={[
          { label: t.navbar.home, href: href("/") },
          { label: t.navbar.portfolio, href: href(PORTFOLIO_BASE_PATH) },
        ]}
      />

      <p className="type-section-label font-mono text-orange mb-3">{p.label}</p>
      <h1 className="type-course-page-title font-dm font-bold text-cream mb-4 max-w-4xl">
        {p.title}
      </h1>
      <p className="type-section-body font-dm text-cream max-w-2xl mb-4 leading-relaxed">
        {p.description}
      </p>
      <p className="type-section-body font-dm text-cream/90 max-w-2xl leading-relaxed">
        {p.descriptionMore}
      </p>
    </>
  );

  return (
    <div className="flex-1 w-full bg-background text-cream flex flex-col">
      {heroSrc ? <PageHero src={heroSrc} alt={p.title}>{intro}</PageHero> : null}

      <div
        className={
          heroSrc
            ? "max-w-6xl mx-auto overflow-visible px-8 md:px-12 lg:px-16 pt-12 md:pt-16 pb-24 w-full"
            : "max-w-6xl mx-auto overflow-visible px-8 md:px-12 lg:px-16 pt-32 pb-24 w-full"
        }
      >
        {heroSrc ? null : <div className="mb-14">{intro}</div>}

        <PortfolioSections />

        <ConsultationCtaBanner embedded className="mt-14 md:mt-16" />
      </div>
    </div>
  );
}
