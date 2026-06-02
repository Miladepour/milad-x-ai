"use client";

import Image from "next/image";
import Link from "next/link";
import type { Course } from "@/lib/courses/types";
import { COURSES_BASE_PATH, formatCoursePriceDisplay } from "@/lib/courses";
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

  return (
    <Link
      href={href(`${COURSES_BASE_PATH}/${course.slug}`)}
      className="group flex flex-col bg-surface rounded-sm overflow-hidden border border-transparent hover:border-orange/40 transition-colors duration-200"
    >
      <div className="h-48 bg-background flex-shrink-0 relative overflow-hidden">
        <Image
          src={course.coverImage}
          alt={course.listTitle}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          sizes="(max-width: 768px) 100vw, 400px"
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

        <div className="flex flex-wrap gap-4 font-dm text-sm text-cream">
          <span>
            <span className="text-cream/80">{p.dateLabel}: </span>
            {course.date}
          </span>
          <span>
            <span className="text-cream/80">{p.priceLabel}: </span>
            <span className="text-orange font-semibold">
              {formatCoursePriceDisplay(course, lang)}
            </span>
          </span>
        </div>

        <h2 className="type-course-card-title font-dm font-semibold text-cream group-hover:text-orange transition-colors">
          {course.listTitle}
        </h2>

        <p className="type-card-body font-dm text-cream leading-relaxed flex-1 line-clamp-3">
          {course.excerpt}
        </p>

        <span className="font-mono text-xs text-orange">{t.coursesPage.viewDetails}</span>
      </div>
    </Link>
  );
}
