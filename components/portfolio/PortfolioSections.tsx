"use client";

import Image from "next/image";
import Link from "next/link";
import PortfolioCarousel from "@/components/portfolio/PortfolioCarousel";
import ReelCoverFlowCarousel from "@/components/portfolio/ReelCoverFlowCarousel";
import {
  portfolioApplications,
  portfolioReels,
  portfolioSquareImages,
} from "@/lib/portfolio/media";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface PortfolioSectionsProps {
  showReels?: boolean;
  showImages?: boolean;
  showApplications?: boolean;
}

export default function PortfolioSections({
  showReels = true,
  showImages = true,
  showApplications = true,
}: PortfolioSectionsProps) {
  const t = useTranslation();
  const p = t.portfolioPage;
  const w = t.aiwork;

  return (
    <div className="flex flex-col gap-16 md:gap-20">
      {showReels && (
        <section aria-labelledby="portfolio-reels-heading" className="overflow-hidden">
          <h2
            id="portfolio-reels-heading"
            className="font-mono text-xs text-orange uppercase tracking-widest rtl:tracking-normal mb-6"
          >
            {w.reelsTitle}
          </h2>
          <ReelCoverFlowCarousel reels={portfolioReels} ariaLabel={w.reelsTitle} />
        </section>
      )}

      {showImages && (
        <section aria-labelledby="portfolio-images-heading" className="overflow-hidden">
          <h2
            id="portfolio-images-heading"
            className="font-mono text-xs text-orange uppercase tracking-widest rtl:tracking-normal mb-6"
          >
            {w.imagesTitle}
          </h2>
          {portfolioSquareImages.length > 0 ? (
            <PortfolioCarousel
              ariaLabel={w.imagesTitle}
              prevLabel={w.scrollPrev}
              nextLabel={w.scrollNext}
            >
              {portfolioSquareImages.map((item) => (
                <article
                  key={item.id}
                  className="group relative flex-shrink-0 w-[min(calc(100vw-5rem),320px)] snap-center snap-always overflow-hidden rounded-sm bg-surface aspect-square"
                >
                  <Image
                    src={item.src}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    sizes="320px"
                  />
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-5 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(255,92,0,0.88) 0%, transparent 55%)",
                    }}
                  >
                    <p className="font-dm text-sm font-semibold text-cream">{item.title}</p>
                  </div>
                </article>
              ))}
            </PortfolioCarousel>
          ) : (
            <p className="font-dm text-sm text-muted border border-surface rounded-sm bg-surface/30 px-6 py-10 text-center max-w-xl">
              {p.imagesEmpty}
            </p>
          )}
        </section>
      )}

      {showApplications && (
        <section aria-labelledby="portfolio-apps-heading">
          <h2
            id="portfolio-apps-heading"
            className="font-mono text-xs text-orange uppercase tracking-widest rtl:tracking-normal mb-6"
          >
            {p.applicationsTitle}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {portfolioApplications.map((app) => {
              const inner = (
                <>
                  <h3 className="type-card-title font-dm font-semibold text-cream group-hover:text-orange transition-colors">
                    {app.title}
                  </h3>
                  <p className="type-card-body font-dm text-cream/75 leading-relaxed mt-3 flex-1">
                    {app.description}
                  </p>
                  <ul className="flex flex-wrap gap-2 mt-4">
                    {app.tags.map((tag) => (
                      <li
                        key={tag}
                        className="font-mono text-[10px] uppercase tracking-widest rtl:tracking-normal text-orange border border-orange/40 px-2 py-0.5 rounded-sm"
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                  {app.href && (
                    <span className="inline-block mt-4 font-mono text-xs text-orange group-hover:text-cream transition-colors">
                      {p.viewApp} →
                    </span>
                  )}
                </>
              );

              const className =
                "group flex flex-col h-full border border-surface bg-surface/40 rounded-sm p-6 hover:border-orange/40 transition-colors";

              if (app.href) {
                return (
                  <Link
                    key={app.id}
                    href={app.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={className}
                  >
                    {inner}
                  </Link>
                );
              }

              return (
                <article key={app.id} className={className}>
                  {inner}
                </article>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
