'use client';

import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import { useRef } from 'react';
import { useLanguage } from '@/lib/i18n/context';
import { useTranslation } from '@/lib/i18n/useTranslation';
import type { Course } from '@/lib/courses';
import { COURSES_BASE_PATH } from '@/lib/courses';

const ease = [0.25, 0.46, 0.45, 0.94] as const;

interface CoursesProps {
  courses: Course[];
}

export default function Courses({ courses: catalog }: CoursesProps) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const t = useTranslation();
  const { href } = useLanguage();

  const displayItems = catalog.map((course) => ({
    id: course.slug,
    title: course.listTitle,
    description: course.excerpt,
    date: course.date,
    coverImage: course.coverImage,
    detailHref: href(`${COURSES_BASE_PATH}/${course.slug}`),
  }));

  return (
    <section ref={ref} className="w-full bg-background py-28 px-8 md:px-12 lg:px-16">
      <div className="max-w-6xl mx-auto flex flex-col gap-3">

        <header>
          <span className="type-section-label font-mono text-orange uppercase tracking-[0.35em] rtl:tracking-normal block mb-1">
            {t.courses.label}
          </span>
          <div className="flex items-end justify-between gap-4">
            <h2 className="type-course-page-title font-dm font-bold text-cream leading-tight min-w-0 m-0">
              {t.courses.heading}
            </h2>
            <Link
              href={href(COURSES_BASE_PATH)}
              className="font-dm text-sm text-orange hover:text-cream transition-colors whitespace-nowrap shrink-0"
            >
              {t.coursesPage.viewAll}
            </Link>
          </div>
        </header>

        <div
          className="flex gap-5 overflow-x-auto pb-2 -mx-1 px-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
        >
          {displayItems.map((course, i) => (
            <motion.article
              key={course.id}
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.4, delay: 0.05 + i * 0.06, ease }}
              className="flex-shrink-0 w-[min(88vw,320px)] md:w-[300px] bg-surface flex flex-col overflow-hidden rounded-sm"
            >
              <Link href={course.detailHref} className="block relative aspect-[16/10] bg-background">
                <Image
                  src={course.coverImage}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="320px"
                />
              </Link>

              <div className="flex flex-col flex-1 p-5 gap-3">
                <div className="flex items-center justify-end">
                  <span className="type-badge-meta font-mono text-muted text-xs">
                    {course.date}
                  </span>
                </div>

                <h3 className="type-card-title font-dm font-semibold text-cream leading-tight m-0">
                  <Link href={course.detailHref} className="hover:text-orange transition-colors">
                    {course.title}
                  </Link>
                </h3>

                <p className="type-card-body font-dm text-muted leading-relaxed flex-1 m-0 line-clamp-3">
                  {course.description}
                </p>

                <Link
                  href={course.detailHref}
                  className="font-dm text-sm text-orange hover:text-cream transition-colors"
                >
                  {t.coursesPage.viewDetails}
                </Link>
              </div>
            </motion.article>
          ))}
        </div>

      </div>
    </section>
  );
}
