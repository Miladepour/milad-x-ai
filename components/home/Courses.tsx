'use client';

import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import { useRef } from 'react';
import Button from '@/components/ui/Button';
import { useLanguage } from '@/lib/i18n/context';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { getCourses, COURSES_BASE_PATH, getWaitlistPath } from '@/lib/courses';

const ease = [0.25, 0.46, 0.45, 0.94] as const;

type Status = 'Live' | 'Coming Soon' | 'Closed';

const badgeClass: Record<Status, string> = {
  Live: 'bg-orange text-background border-orange',
  'Coming Soon': 'bg-transparent text-orange border-orange',
  Closed: 'bg-transparent text-muted border-muted',
};

export default function Courses() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const t = useTranslation();
  const { lang, href } = useLanguage();
  const catalog = getCourses(lang);

  const displayItems = catalog.map((course) => ({
    id: course.slug,
    title: course.listTitle,
    description: course.excerpt,
    date: course.date,
    status: course.status,
    detailHref: href(`${COURSES_BASE_PATH}/${course.slug}`),
    ctaHref:
      course.status === 'Live'
        ? href(getWaitlistPath(course.slug))
        : href(`${COURSES_BASE_PATH}/${course.slug}`),
  }));

  return (
    <section ref={ref} className="w-full bg-background py-28 px-8 md:px-12 lg:px-16">
      <div className="max-w-6xl mx-auto">

        <div className="mb-14 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, ease }}
              className="type-section-label font-mono text-orange uppercase tracking-[0.35em] rtl:tracking-normal"
            >
              {t.courses.label}
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 32 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.75, delay: 0.1, ease }}
              className="type-hero-h1 font-dm font-bold text-cream mt-3"
            >
              {t.courses.heading}
            </motion.h2>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.15, ease }}
          >
            <Link
              href={href(COURSES_BASE_PATH)}
              className="font-dm text-sm text-orange hover:text-cream transition-colors"
            >
              {t.coursesPage.viewAll}
            </Link>
          </motion.div>
        </div>

        <div
          className="flex gap-6 overflow-x-auto pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
        >
          {displayItems.map((course, i) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 48 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.2 + i * 0.14, ease }}
              className="flex-shrink-0 bg-surface flex flex-col"
              style={{ borderRadius: '2px', width: '340px' }}
            >
              <div
                className="w-full bg-background flex-shrink-0"
                style={{ height: '200px' }}
              />

              <div className="flex flex-col flex-1 p-6 gap-4">
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={`type-badge font-mono uppercase tracking-widest rtl:tracking-normal border px-2 py-1 ${badgeClass[course.status]}`}
                    style={{ borderRadius: '2px' }}
                  >
                    {t.coursesPage.statusLabels[course.status]}
                  </span>
                  <span className="type-badge-meta font-mono text-muted">
                    {course.date}
                  </span>
                </div>

                <h3 className="type-card-title font-dm font-semibold text-cream leading-tight">
                  {course.title}
                </h3>

                <p className="type-card-body font-dm text-muted leading-relaxed flex-1">
                  {course.description}
                </p>

                <div className="flex flex-col gap-3">
                  <Link href={course.ctaHref}>
                    <Button
                      variant="primary"
                      size="sm"
                      className="rtl:normal-case rtl:tracking-normal"
                    >
                      {t.courses.ctaLabels[course.status]}
                    </Button>
                  </Link>
                  <Link
                    href={course.detailHref}
                    className="font-dm text-xs text-muted hover:text-orange transition-colors"
                  >
                    {t.coursesPage.viewDetails}
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
