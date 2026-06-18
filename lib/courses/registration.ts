import { TELEGRAM_APPLY_URL } from "./constants";
import type { Course } from "./types";

/** Slugs that use Telegram apply flow when `meta.applyUrl` is missing in the database. */
const APPLY_URL_BY_SLUG: Record<string, string> = {
  "prompt-to-content": TELEGRAM_APPLY_URL,
  "prompt-to-website": TELEGRAM_APPLY_URL,
};

export function getCourseApplyUrl(
  course: Pick<Course, "slug" | "meta">
): string | null {
  const fromMeta = course.meta.applyUrl?.trim();
  if (fromMeta) return fromMeta;
  return APPLY_URL_BY_SLUG[course.slug] ?? null;
}

export function courseUsesExternalApply(course: Pick<Course, "slug" | "meta">): boolean {
  return getCourseApplyUrl(course) != null;
}
