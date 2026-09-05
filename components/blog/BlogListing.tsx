"use client";

import Image from "next/image";
import Link from "next/link";
import type { BlogPost } from "@/lib/blog/types";
import { BLOG_BASE_PATH } from "@/lib/blog/constants";
import { useLanguage } from "@/lib/i18n/context";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { toLocaleDigits } from "@/lib/i18n/digits";
import PageBreadcrumb from "@/components/layout/PageBreadcrumb";
import PageHero from "@/components/shared/PageHero";

interface BlogListingProps {
  initialPosts: BlogPost[];
  heroSrc?: string | null;
}

export default function BlogListing({ initialPosts, heroSrc }: BlogListingProps) {
  const { lang, href } = useLanguage();
  const t = useTranslation();
  const p = t.blogPage;

  const intro = (
    <>
      <PageBreadcrumb
        ariaLabel={t.navbar.breadcrumbAria}
        variant={heroSrc ? "hero" : "default"}
        className={heroSrc ? "mb-8" : "mb-10"}
        items={[
          { label: t.navbar.home, href: href("/") },
          { label: t.navbar.blog, href: href(BLOG_BASE_PATH) },
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
            ? "max-w-6xl mx-auto px-8 md:px-12 lg:px-16 pt-12 md:pt-16 pb-24 w-full flex-1 flex flex-col"
            : "max-w-6xl mx-auto px-8 md:px-12 lg:px-16 pt-32 pb-24 w-full flex-1 flex flex-col"
        }
      >
        {heroSrc ? null : <div className="mb-14">{intro}</div>}

        {initialPosts.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-16 md:py-24 border border-surface rounded-sm bg-surface/20 px-8">
            <p className="font-mono text-xs text-orange uppercase tracking-widest rtl:tracking-normal mb-4">
              {p.emptyLabel}
            </p>
            <h2 className="type-course-section-heading font-dm font-bold text-cream mb-3">
              {p.emptyTitle}
            </h2>
            <p className="type-section-body font-dm text-cream/80 max-w-md leading-relaxed">
              {p.emptyMessage}
            </p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {initialPosts.map((post) => (
              <li key={post.slug}>
                <Link
                  href={href(`${BLOG_BASE_PATH}/${post.slug}`)}
                  className="group block overflow-hidden border border-surface rounded-sm bg-surface/30 hover:border-orange/40 transition-colors"
                >
                  {post.coverImage ? (
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-background">
                      <Image
                        src={post.coverImage}
                        alt=""
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                        sizes="(max-width: 768px) 100vw, 480px"
                      />
                    </div>
                  ) : null}
                  <div className="p-6">
                    <time className="font-mono text-xs text-orange">
                      {toLocaleDigits(post.date, lang)}
                    </time>
                    <h2 className="type-course-card-title font-dm font-semibold text-cream mt-2 mb-2 group-hover:text-orange transition-colors">
                      {post.title}
                    </h2>
                    <p className="type-card-body font-dm text-cream/80 line-clamp-3 leading-relaxed">
                      {post.excerpt}
                    </p>
                    <span className="inline-block mt-4 font-mono text-xs text-orange">
                      {p.readMore}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
