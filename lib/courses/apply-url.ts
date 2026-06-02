import { getCourseApplyUrl } from "./registration";
import type { Course } from "./types";

/** Ensures slug-based apply URLs are set even when the database row omits `meta.applyUrl`. */
export function withResolvedApplyUrl(course: Course): Course {
  const applyUrl = getCourseApplyUrl(course);
  if (!applyUrl || course.meta.applyUrl === applyUrl) return course;
  return {
    ...course,
    meta: { ...course.meta, applyUrl },
  };
}
