import { toLocaleDigits } from "@/lib/i18n/digits";
import type { Locale } from "@/lib/i18n/translations";
import type { Course } from "../types";
import { COURSES_BASE_PATH } from "../constants";
import { promptToContentCourseEn } from "./en";
import { promptToContentCourseFa } from "./fa";

export { COURSES_BASE_PATH } from "../constants";

const coursesByLocale: Record<Locale, Course[]> = {
  EN: [promptToContentCourseEn],
  FA: [promptToContentCourseFa],
};

export const courseSlugs = coursesByLocale.EN.map((c) => c.slug);

/** Static fallback — prefer async getters from lib/courses/store */
export function getCourses(locale: Locale): Course[] {
  return coursesByLocale[locale];
}

export function getCourseBySlug(slug: string, locale: Locale): Course | undefined {
  return coursesByLocale[locale].find((c) => c.slug === slug);
}

export function getWaitlistPath(slug: string): string {
  return `${COURSES_BASE_PATH}/${slug}/waitlist`;
}

export function formatCoursePrice(priceUsd: number, locale: Locale): string {
  const amount = toLocaleDigits(priceUsd, locale);
  return locale === "FA" ? `${amount} دلار` : `$${amount}`;
}
