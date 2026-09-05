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
          <span className="home-section-label font-mono text-orange uppercase tracking-[0.35em] rtl:tracking-normal block mb-1">
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
    <div className="grid grid-cols-1 items-stretch md:grid-cols-2 gap-5">
      {items.map((course) => {
        const body = (
          <>
            <div className="flex min-h-0 min-w-0 flex-1 flex-col justify-center gap-1 px-3.5 py-3 text-start sm:gap-1.5 sm:px-5">
              <div>
                {course.openable ? (
                  <span className="type-badge-meta font-mono text-muted text-[10px] sm:text-xs">
                    {course.date}
                  </span>
                ) : (
                  <span
                    className="type-badge font-mono border border-orange px-2 py-0.5 text-orange sm:py-1"
                    style={{ borderRadius: "2px" }}
                  >
                    {t.coursesPage.statusLabels[course.status]}
                  </span>
                )}
              </div>

              <p className="font-dm font-semibold text-cream m-0 line-clamp-2 overflow-hidden min-w-0 text-[15px] leading-[1.45] sm:text-[18px] md:text-[20px] rtl:text-[14px] rtl:leading-[1.55] sm:rtl:text-[16px] md:rtl:text-[18px]">
                {course.title}
              </p>

              <p className="font-dm text-muted m-0 line-clamp-2 overflow-hidden min-w-0 [word-break:keep-all] text-[12px] leading-[1.7] sm:text-[13px] md:text-[14px] rtl:text-[12.5px] rtl:leading-[1.75] sm:rtl:text-[13.5px] md:rtl:text-[14px]">
                {course.description}
              </p>

              {course.openable ? (
                <span className="font-dm text-xs sm:text-sm text-orange group-hover:text-cream transition-colors shrink-0">
                  {t.coursesPage.viewDetails}
                </span>
              ) : null}
            </div>

            <div className="relative h-full w-[108px] shrink-0 bg-background sm:w-[160px] md:w-[208px]">
              <CourseCoverImage
                src={course.coverImage}
                alt={course.title}
                seed={course.id}
                sizes="208px"
                className={
                  course.openable
                    ? "object-cover object-center transition-transform duration-300 group-hover:scale-[1.03]"
                    : "object-cover object-center"
                }
              />
            </div>
          </>
        );

        return (
          <article
            key={course.id}
            className={`h-full home-course-glass ${
              course.openable
                ? "group hover:border-orange/45 transition-colors duration-200"
                : ""
            }`}
          >
            {course.openable ? (
              <Link
                href={course.detailHref}
                className="flex h-[192px] flex-row items-stretch rtl:flex-row-reverse md:h-[208px]"
              >
                {body}
              </Link>
            ) : (
              <div className="flex h-[192px] flex-row items-stretch rtl:flex-row-reverse md:h-[208px]">
                {body}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
