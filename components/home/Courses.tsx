'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/context';
import { useTranslation } from '@/lib/i18n/useTranslation';
import type { Course } from '@/lib/courses';
import { COURSES_BASE_PATH } from '@/lib/courses';

interface CoursesProps {
  courses: Course[];
}

export default function Courses({ courses: catalog }: CoursesProps) {
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
    <section className="w-full bg-background pt-10 md:pt-12 pb-10 md:pb-12 px-8 md:px-12 lg:px-16">
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
          className="flex gap-5 overflow-x-auto overscroll-x-contain pb-2 -mx-1 px-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {displayItems.map((course) => (
            <article
              key={course.id}
              className="flex-shrink-0 w-[min(calc(100vw-4rem),300px)] md:w-[300px] bg-surface flex flex-col overflow-hidden rounded-sm"
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
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
