"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { BlogPost } from "@/lib/blog/types";
import { useLanguage } from "@/lib/i18n/context";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { toLocaleDigits } from "@/lib/i18n/digits";

export default function BlogListing() {
  const { lang } = useLanguage();
  const t = useTranslation();
  const p = t.blogPage;
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCurrent = true;

    setIsLoading(true);
    fetch(`/api/blog?locale=${lang}`)
      .then((res) => res.json())
      .then((data) => {
        if (isCurrent) setPosts(Array.isArray(data.posts) ? data.posts : []);
      })
      .catch(() => {
        if (isCurrent) setPosts([]);
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [lang]);

  return (
    <div className="flex-1 w-full bg-background text-cream flex flex-col">
      <div className="max-w-6xl mx-auto px-8 md:px-12 lg:px-16 pt-32 pb-24 w-full flex-1 flex flex-col">
        <Link
          href="/"
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

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center border border-surface bg-surface/20 px-8 py-16 text-center font-mono text-xs uppercase tracking-widest text-orange">
            Loading posts
          </div>
        ) : posts.length === 0 ? (
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
            {posts.map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group block border border-surface rounded-sm bg-surface/30 p-6 hover:border-orange/40 transition-colors"
                >
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
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
