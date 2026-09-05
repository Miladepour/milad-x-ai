'use client';

import Image from 'next/image';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import TutorialCardCover from '@/components/tutorials/TutorialCardCover';
import { useLanguage } from '@/lib/i18n/context';
import { toLocaleDigits } from '@/lib/i18n/digits';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { TUTORIALS_BASE_PATH } from '@/lib/tutorials/constants';
import type { Tutorial } from '@/lib/tutorials/types';

interface FreeTutorialsProps {
  tutorials: Tutorial[];
}

export default function FreeTutorials({ tutorials }: FreeTutorialsProps) {
  const { lang, href } = useLanguage();
  const t = useTranslation();
  const p = t.tutorialsPage;

  return (
    <section
      id="tutorials"
      aria-labelledby="home-tutorials-heading"
      className="w-full border-t border-white/[0.08] bg-background px-8 py-20 md:px-12 md:py-24 lg:px-16"
    >
      <div className="mx-auto max-w-6xl">
        <header className="max-w-2xl text-start">
          <span className="home-section-label block font-mono uppercase tracking-[0.35em] text-orange rtl:tracking-normal">
            {p.label}
          </span>
          <h2
            id="home-tutorials-heading"
            className="type-course-page-title mt-2 font-dm font-bold leading-tight text-cream"
          >
            {p.title}
          </h2>
        </header>

        {tutorials.length > 0 ? (
          <ul className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {tutorials.map((tutorial) => (
              <li key={tutorial.slug} className="last:sm:col-span-2 last:lg:col-span-1">
                <Link
                  href={href(`${TUTORIALS_BASE_PATH}/${tutorial.slug}`)}
                  className="group block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-4 focus-visible:ring-offset-background"
                >
                  <article className="flex h-full flex-col">
                    <div className="relative aspect-video overflow-hidden rounded-[15px] border border-white/[0.14] bg-surface">
                      {tutorial.coverImage ? (
                        <>
                          <Image
                            src={tutorial.coverImage}
                            alt={tutorial.title}
                            fill
                            sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-[1.025]"
                          />
                          <div
                            className="absolute inset-0 bg-gradient-to-t from-background via-background/15 to-transparent"
                            aria-hidden="true"
                          />
                          <span className="absolute start-4 top-4 rounded-full border border-orange/45 bg-background/75 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-orange backdrop-blur-sm rtl:tracking-normal">
                            {p.freeBadge}
                          </span>
                          <h3 className="absolute inset-x-4 bottom-4 line-clamp-2 text-start font-dm text-lg font-semibold leading-snug text-cream">
                            {tutorial.title}
                          </h3>
                        </>
                      ) : (
                        <TutorialCardCover title={tutorial.title} freeLabel={p.freeBadge} />
                      )}
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-4 px-1">
                      <time className="font-mono text-[11px] text-cream/50">
                        {toLocaleDigits(tutorial.date, lang)}
                      </time>
                      <span className="shrink-0 font-mono text-[11px] text-orange transition-colors group-hover:text-cream">
                        {p.watchTutorial}
                      </span>
                    </div>
                  </article>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-10 border-y border-white/[0.1] py-8 text-start md:flex md:items-center md:justify-between md:gap-10">
            <h3 className="font-dm text-xl font-semibold text-cream">{p.emptyTitle}</h3>
            <p className="mt-3 max-w-xl font-dm text-sm leading-relaxed text-cream/60 md:mt-0">
              {p.emptyMessage}
            </p>
          </div>
        )}

        <div className="mt-10 flex justify-center">
          <Button variant="outline" size="lg" href={href(TUTORIALS_BASE_PATH)}>
            {p.viewAllCta}
          </Button>
        </div>
      </div>
    </section>
  );
}
