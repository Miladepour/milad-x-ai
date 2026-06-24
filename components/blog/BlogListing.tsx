"use client";

import Image from "next/image";
import Link from "next/link";
import type { BlogPost } from "@/lib/blog/types";
import { useLanguage } from "@/lib/i18n/context";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { toLocaleDigits } from "@/lib/i18n/digits";

interface BlogListingProps {
  initialPosts: BlogPost[];
}

export default function BlogListing({ initialPosts }: BlogListingProps) {
  const { lang, href } = useLanguage();
  const t = useTranslation();
  const p = t.blogPage;

  return (
    <div className="flex-1 w-full bg-background text-cream flex flex-col">
      <div className="max-w-6xl mx-auto px-8 md:px-12 lg:px-16 pt-32 pb-24 w-full flex-1 flex flex-col">
        <Link
          href={href("/")}
          className="font-dm text-sm text-muted hover:text-cream transition-colors mb-10 inline-block"
        >
          {p.backHome}
        </Link>

        <p className="type-section-label font-mono text-orange mb-3">{p.label}</p>
        <h1 className="type-course-page-title font-dm font-bold text-cream mb-4">
          {p.title}
        </h1>
        <p className="type-section-body font-dm text-cream max-w-2xl mb-14 leading-relaxed">
          {p.description}
        </p>

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
                  href={href(`/blog/${post.slug}`)}
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
