"use client";

import Link from "next/link";
import type { Course } from "@/lib/courses/types";
import { COURSES_BASE_PATH, formatCoursePrice, isCourseOpenable } from "@/lib/courses";
import CourseCoverImage from "./CourseCoverImage";
import CourseIranTelegramNote from "./CourseIranTelegramNote";
import { useLanguage } from "@/lib/i18n/context";
import { useTranslation } from "@/lib/i18n/useTranslation";

const statusClass: Record<Course["status"], string> = {
  Live: "bg-orange text-background border-orange",
  "Coming Soon": "bg-transparent text-orange border-orange",
  Closed: "bg-transparent text-muted border-muted",
};

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  const { lang, href } = useLanguage();
  const t = useTranslation();
  const p = t.coursesPage;
  const statusLabel = p.statusLabels[course.status];
  const openable = isCourseOpenable(course);
  const courseHref = href(`${COURSES_BASE_PATH}/${course.slug}`);

  const body = (
    <>
      <div className="h-48 bg-background flex-shrink-0 relative overflow-hidden">
        <CourseCoverImage
          src={course.coverImage}
          alt={course.listTitle}
          seed={course.slug}
          sizes="(max-width: 768px) 100vw, 33vw"
          className={
            openable
              ? "object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              : "object-cover"
          }
        />
      </div>

      <div className="flex flex-col flex-1 p-6 gap-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <span
            className={`type-badge font-mono border px-2 py-1 ${statusClass[course.status]}`}
            style={{ borderRadius: "2px" }}
          >
            {statusLabel}
          </span>
        </div>

        {openable ? (
          <div className="flex flex-wrap gap-4 font-dm text-sm text-cream">
            <span>
              <span className="text-cream/80">{p.dateLabel}: </span>
              {course.date}
            </span>
            <span>
              <span className="text-cream/80">{p.priceLabel}: </span>
              <span className="text-orange font-semibold">
                {formatCoursePrice(course.priceUsd, lang)}
              </span>
            </span>
          </div>
        ) : null}

        <h3
          className={`type-course-card-title font-dm font-semibold text-cream ${
            openable ? "group-hover:text-orange transition-colors" : ""
          }`}
        >
          {course.listTitle}
        </h3>

        <p className="type-card-body font-dm text-cream leading-relaxed flex-1 line-clamp-3">
          {course.excerpt}
        </p>

        {openable ? (
          <span className="font-mono text-xs text-orange">{t.coursesPage.viewDetails}</span>
        ) : null}
      </div>
    </>
  );

  return (
    <article
      className={`flex flex-col bg-surface rounded-sm overflow-hidden border border-transparent ${
        openable
          ? "group hover:border-orange/40 transition-colors duration-200"
          : "cursor-default"
      }`}
    >
      {openable ? (
        <Link href={courseHref} className="flex flex-col flex-1">
          {body}
        </Link>
      ) : (
        <div className="flex flex-col flex-1">{body}</div>
      )}

      {openable ? (
        <div className="px-6 pb-6 -mt-2">
          <CourseIranTelegramNote lang={lang} />
        </div>
      ) : null}
    </article>
  );
}
