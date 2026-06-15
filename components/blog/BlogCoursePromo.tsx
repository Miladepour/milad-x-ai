import Image from "next/image";
import Link from "next/link";
import { COURSES_BASE_PATH, formatCoursePrice } from "@/lib/courses";
import { getCourses } from "@/lib/courses/store";
import type { Course } from "@/lib/courses/types";
import type { UrlLocale } from "@/lib/i18n/config";
import { localizedPath } from "@/lib/i18n/paths";
import { translations } from "@/lib/i18n/translations";

const statusClass: Record<Course["status"], string> = {
  Live: "bg-orange text-background border-orange",
  "Coming Soon": "bg-transparent text-orange border-orange",
  Closed: "bg-transparent text-muted border-muted",
};

interface BlogCoursePromoProps {
  locale: UrlLocale;
}

export default async function BlogCoursePromo({ locale }: BlogCoursePromoProps) {
  const courses = (await getCourses("FA")).filter((course) => course.status !== "Closed");
  const labels = translations.FA.coursesPage;

  if (courses.length === 0) return null;

  return (
    <div className="my-10 grid gap-5 sm:grid-cols-2">
      {courses.map((course) => {
        const href = localizedPath(`${COURSES_BASE_PATH}/${course.slug}`, locale);
        const statusLabel = labels.statusLabels[course.status];

        return (
          <article
            key={course.slug}
            className="group flex flex-col overflow-hidden rounded-sm border border-surface bg-surface transition-colors duration-200 hover:border-orange/40"
          >
            <Link href={href} className="flex flex-1 flex-col">
              <div className="relative h-44 flex-shrink-0 overflow-hidden bg-background">
                <Image
                  src={course.coverImage}
                  alt={course.listTitle}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  sizes="(max-width: 768px) 100vw, 400px"
                />
              </div>
              <div className="flex flex-1 flex-col gap-3 p-5">
                <span
                  className={`type-badge w-fit border px-2 py-1 font-mono ${statusClass[course.status]}`}
                  style={{ borderRadius: "2px" }}
                >
                  {statusLabel}
                </span>
                <div className="flex flex-wrap gap-3 font-dm text-sm text-cream">
                  <span>
                    <span className="text-cream/80">{labels.dateLabel}: </span>
                    {course.date}
                  </span>
                  <span>
                    <span className="text-cream/80">{labels.priceLabel}: </span>
                    <span className="font-semibold text-orange">
                      {formatCoursePrice(course.priceUsd, "FA")}
                    </span>
                  </span>
                </div>
                <h3 className="type-course-card-title font-dm font-semibold text-cream transition-colors group-hover:text-orange">
                  {course.listTitle}
                </h3>
                <p className="type-card-body line-clamp-3 flex-1 font-dm leading-relaxed text-cream">
                  {course.excerpt}
                </p>
                <span className="font-mono text-xs text-orange">{labels.viewDetails}</span>
              </div>
            </Link>
          </article>
        );
      })}
    </div>
  );
}
