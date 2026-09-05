'use client';

import Link from 'next/link';
import { Clapperboard, Radio } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';
import { useTranslation } from '@/lib/i18n/useTranslation';
import type { Course } from '@/lib/courses';
import { COURSES_BASE_PATH, isCourseOpenable, isOfflineCourse } from '@/lib/courses';
import CourseCoverImage from '@/components/courses/CourseCoverImage';
import CourseGroupSection from '@/components/courses/CourseGroupSection';

interface CoursesProps {
  courses: Course[];
}

export default function Courses({ courses: catalog }: CoursesProps) {
  const t = useTranslation();
  const { href } = useLanguage();
  const p = t.coursesPage;
  const offlineCourses = catalog.filter(isOfflineCourse);
  const onlineCourses = catalog.filter((course) => !isOfflineCourse(course));

  const displayItems = (courses: Course[]) =>
    courses.map((course) => ({
      id: course.slug,
      title: course.listTitle,
      description: course.excerpt,
      date: course.date,
      coverImage: course.coverImage,
      status: course.status,
      openable: isCourseOpenable(course),
      detailHref: href(`${COURSES_BASE_PATH}/${course.slug}`),
    }));

  return (
    <section className="w-full bg-background pt-10 md:pt-12 pb-10 md:pb-12 px-8 md:px-12 lg:px-16">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
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
              {p.viewAll}
            </Link>
          </div>
        </header>

        {offlineCourses.length > 0 ? (
          <CourseGroupSection
            title={p.offlineTitle}
            description={p.offlineDescription}
            headingLevel="h3"
            icon={Clapperboard}
          >
            <HomeCourseGrid items={displayItems(offlineCourses)} />
          </CourseGroupSection>
        ) : null}

        {onlineCourses.length > 0 ? (
          <CourseGroupSection
            title={p.onlineTitle}
            description={p.onlineDescription}
            headingLevel="h3"
            icon={Radio}
            className="pt-8 border-t border-surface/80"
          >
            <HomeCourseGrid items={displayItems(onlineCourses)} />
          </CourseGroupSection>
        ) : null}
      </div>
    </section>
  );
}

interface HomeCourseItem {
  id: string;
  title: string;
  description: string;
  date: string;
  coverImage: string;
  status: Course['status'];
  openable: boolean;
  detailHref: string;
}

function HomeCourseGrid({ items }: { items: HomeCourseItem[] }) {
  const t = useTranslation();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {items.map((course) => (
        <article
          key={course.id}
          className="bg-surface flex flex-col overflow-hidden rounded-sm"
        >
          <div className="relative aspect-[16/10] bg-background">
            {course.openable ? (
              <Link href={course.detailHref} className="absolute inset-0">
                <CourseCoverImage
                  src={course.coverImage}
                  alt={course.title}
                  seed={course.id}
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </Link>
            ) : (
              <CourseCoverImage
                src={course.coverImage}
                alt={course.title}
                seed={course.id}
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            )}
          </div>

          <div className="flex flex-col flex-1 p-5 gap-3">
            <div className="flex items-center justify-end">
              {course.openable ? (
                <span className="type-badge-meta font-mono text-muted text-xs">
                  {course.date}
                </span>
              ) : (
                <span
                  className="type-badge font-mono border border-orange px-2 py-1 text-orange"
                  style={{ borderRadius: "2px" }}
                >
                  {t.coursesPage.statusLabels[course.status]}
                </span>
              )}
            </div>

            <p className="type-card-title font-dm font-semibold text-cream leading-tight m-0">
              {course.openable ? (
                <Link href={course.detailHref} className="hover:text-orange transition-colors">
                  {course.title}
                </Link>
              ) : (
                course.title
              )}
            </p>

            <p className="type-card-body font-dm text-muted leading-relaxed flex-1 m-0 line-clamp-3">
              {course.description}
            </p>

            {course.openable ? (
              <Link
                href={course.detailHref}
                className="font-dm text-sm text-orange hover:text-cream transition-colors"
              >
                {t.coursesPage.viewDetails}
              </Link>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}
