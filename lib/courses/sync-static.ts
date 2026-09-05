import {
  getCourseBySlug as getStaticCourseBySlug,
  getCourses as getStaticCourses,
} from "./data/index";
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
      tutors: staticCourse.meta.tutors ?? course.meta.tutors,
    },
  };
}

/** Keep static-only courses (e.g. coming soon) visible when the DB catalog is incomplete. */
export function appendMissingStaticCourses(courses: Course[], locale: Locale): Course[] {
  const seen = new Set(courses.map((course) => course.slug));
  const extras = getStaticCourses(locale).filter((course) => !seen.has(course.slug));
  if (extras.length === 0) return courses;
  return [...courses, ...extras];
}
