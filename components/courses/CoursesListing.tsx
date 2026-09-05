"use client";

import { useState } from "react";
import {
  Award,
  Clapperboard,
  LayoutDashboard,
  MonitorPlay,
  PencilRuler,
  Radio,
  type LucideIcon,
} from "lucide-react";
import type { Course } from "@/lib/courses";
import { isOfflineCourse } from "@/lib/courses";
import { useLanguage } from "@/lib/i18n/context";
import { useTranslation } from "@/lib/i18n/useTranslation";
import ConsultationCtaBanner from "@/components/shared/ConsultationCtaBanner";
import StudentReviewsSection from "@/components/reviews/StudentReviewsSection";
import CourseCard from "./CourseCard";
import CourseFaqAccordion from "./CourseFaqAccordion";
import CourseFormatFilter, { type CourseFormatFilterValue } from "./CourseFormatFilter";
import CourseGroupSection from "./CourseGroupSection";
import type { PublicProgramReview } from "@/lib/reviews/types";
import PageHero from "@/components/shared/PageHero";
import PageBreadcrumb from "@/components/layout/PageBreadcrumb";
import { COURSES_BASE_PATH } from "@/lib/courses";
import { cn } from "@/lib/utils";

const HIGHLIGHT_ICONS: Record<string, LucideIcon> = {
  certificate: Award,
  formats: MonitorPlay,
  skills: PencilRuler,
  portal: LayoutDashboard,
};

interface CoursesListingProps {
  courses: Course[];
  reviews: PublicProgramReview[];
  heroSrc?: string | null;
}

function CourseGrid({ courses }: { courses: Course[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {courses.map((course) => (
        <CourseCard key={course.slug} course={course} />
      ))}
    </div>
  );
}

export default function CoursesListing({ courses, reviews, heroSrc }: CoursesListingProps) {
  const { href, lang } = useLanguage();
  const t = useTranslation();
  const p = t.coursesPage;
  const [format, setFormat] = useState<CourseFormatFilterValue>("all");
  const offlineCourses = courses.filter(isOfflineCourse);
  const onlineCourses = courses.filter((course) => !isOfflineCourse(course));
  const showOffline = format !== "online" && offlineCourses.length > 0;
  const showOnline = format !== "offline" && onlineCourses.length > 0;

  const intro = (
    <>
      <PageBreadcrumb
        ariaLabel={t.navbar.breadcrumbAria}
        variant={heroSrc ? "hero" : "default"}
        className="mb-8"
        items={[
          { label: t.navbar.home, href: href("/") },
          { label: t.navbar.courses, href: href(COURSES_BASE_PATH) },
        ]}
      />

      <h1 className="type-course-page-title font-dm font-bold text-cream mb-4 max-w-4xl">
        {p.title}
      </h1>
      <div className="max-w-3xl space-y-4">
        <p className="type-section-body font-dm text-cream leading-relaxed">{p.description}</p>
        <p className="type-section-body font-dm text-cream/90 leading-relaxed">{p.descriptionMore}</p>
      </div>
    </>
  );

  return (
    <div className="flex-1 w-full bg-background text-cream">
      {heroSrc ? <PageHero src={heroSrc} alt={p.title}>{intro}</PageHero> : null}

      <div
        className={
          heroSrc
            ? "max-w-6xl mx-auto px-8 md:px-12 lg:px-16 pt-12 md:pt-16 pb-24"
            : "max-w-6xl mx-auto px-8 md:px-12 lg:px-16 pt-32 pb-24"
        }
      >
        {heroSrc ? null : intro}

        <ul
          className={cn(
            "grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-7 mb-14 md:mb-16",
            !heroSrc && "mt-10 md:mt-12"
          )}
        >
          {p.highlights.map((item) => {
            const Icon = HIGHLIGHT_ICONS[item.id] ?? PencilRuler;
            return (
              <li key={item.id} className="flex gap-3">
                <Icon
                  className="mt-0.5 h-5 w-5 shrink-0 text-orange"
                  strokeWidth={1.75}
                  aria-hidden
                />
                <div>
                  <p className="font-dm font-semibold text-cream mb-1">{item.title}</p>
                  <p className="type-card-body font-dm text-cream/80 leading-relaxed m-0">
                    {item.text}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="flex flex-col gap-8 md:gap-10">
          <CourseFormatFilter
            value={format}
            onChange={setFormat}
            labels={{
              aria: p.filterAria,
              all: p.filterAll,
              offline: p.filterOffline,
              online: p.filterOnline,
            }}
          />

          <div className="flex flex-col gap-14 md:gap-16">
            {showOffline ? (
              <CourseGroupSection
                title={p.offlineTitle}
                description={p.offlineDescription}
                icon={Clapperboard}
              >
                <CourseGrid courses={offlineCourses} />
              </CourseGroupSection>
            ) : null}

            {showOnline ? (
              <CourseGroupSection
                title={p.onlineTitle}
                description={p.onlineDescription}
                icon={Radio}
                className={showOffline ? "pt-10 md:pt-12 border-t border-surface/80" : undefined}
              >
                <CourseGrid courses={onlineCourses} />
              </CourseGroupSection>
            ) : null}
          </div>
        </div>

        <section className="mt-14 md:mt-16 pt-10 border-t border-surface/80 max-w-3xl">
          <h2 className="type-course-section-heading font-dm font-bold text-cream m-0 mb-3">
            {p.certificateTitle}
          </h2>
          <p className="type-section-body font-dm text-cream/85 leading-relaxed m-0">
            {p.certificateBody}
          </p>
        </section>

        {p.faqItems.length > 0 ? (
          <div className="mt-14 md:mt-16">
            <CourseFaqAccordion id="faq" title={p.faqTitle} items={p.faqItems} lang={lang} />
          </div>
        ) : null}

        {reviews.length > 0 ? (
          <StudentReviewsSection
            reviews={reviews}
            variant="embedded"
            className="mt-14 md:mt-16 pt-10 border-t border-surface/80"
          />
        ) : null}

        <ConsultationCtaBanner embedded className="mt-14 md:mt-16" />
      </div>
    </div>
  );
}
