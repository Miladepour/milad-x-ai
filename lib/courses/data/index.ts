import { toLocaleDigits } from "@/lib/i18n/digits";
import type { Locale } from "@/lib/i18n/translations";
import type { Course } from "../types";
import { COURSES_BASE_PATH, IRAN_TOMAN_PRICE_NOTE_FA } from "../constants";
import { promptToContentCourseEn } from "./en";
import { promptToContentCourseFa } from "./fa";
import { promptToWebsiteCourseEn } from "./prompt-to-website-en";
import { promptToWebsiteCourseFa } from "./prompt-to-website-fa";

export { COURSES_BASE_PATH } from "../constants";

const coursesByLocale: Record<Locale, Course[]> = {
  EN: [promptToContentCourseEn, promptToWebsiteCourseEn],
  FA: [promptToContentCourseFa, promptToWebsiteCourseFa],
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

function formatMillionTomanAmount(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded)
    ? String(rounded)
    : rounded.toFixed(1).replace(/\.0$/, "");
}

/** `priceToman` is stored in millions (e.g. 2.5 → 2.5 million Toman). */
export function formatCoursePriceTomanAmount(
  priceMillionToman: number,
  locale: Locale = "FA"
): string {
  const amount = toLocaleDigits(formatMillionTomanAmount(priceMillionToman), locale);
  return locale === "FA" ? `${amount} میلیون تومان` : `${amount} Million Toman`;
}

/** Million-Toman line; on FA includes the Iran-only disclaimer before the amount. */
export function formatCoursePriceToman(
  priceMillionToman: number,
  locale: Locale = "FA"
): string {
  const price = formatCoursePriceTomanAmount(priceMillionToman, locale);
  if (locale === "FA") {
    return `${IRAN_TOMAN_PRICE_NOTE_FA} ${price}`;
  }
  return price;
}

/** USD price; on FA also appends Toman when set. */
export function formatCoursePriceDisplay(
  course: { priceUsd: number; priceToman?: number | null },
  locale: Locale
): string {
  const usd = formatCoursePrice(course.priceUsd, locale);
  if (locale === "FA" && course.priceToman != null && course.priceToman > 0) {
    return `${usd} · ${formatCoursePriceToman(course.priceToman, locale)}`;
  }
  return usd;
}
