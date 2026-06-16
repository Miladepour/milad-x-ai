import { getCourseBySlug as getStaticCourseBySlug } from "./data/index";
import type { Course } from "./types";
import type { Locale } from "@/lib/i18n/translations";

/**
 * When Supabase is configured, the live site reads from the database. Git deploys
 * do not update Supabase automatically. Overlay cover + price from codebase
 * static files so pushes match localhost without a manual admin re-import.
 */
export function mergeWithStaticCatalog(course: Course, locale: Locale): Course {
  const staticCourse = getStaticCourseBySlug(course.slug, locale);
  if (!staticCourse) return course;

  return {
    ...course,
    coverImage: staticCourse.coverImage,
    priceUsd: staticCourse.priceUsd,
    priceToman: staticCourse.priceToman ?? null,
    date: staticCourse.date,
    meta: {
      ...course.meta,
      sessions: staticCourse.meta.sessions,
      applyUrl: staticCourse.meta.applyUrl ?? course.meta.applyUrl,
      tutors: course.meta.tutors ?? staticCourse.meta.tutors,
    },
  };
}
