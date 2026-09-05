import type { CourseStatus } from "./types";

/** Coming soon listings are visible as cards only. No detail or waitlist page. */
export function isCourseOpenable(course: { status: CourseStatus }): boolean {
  return course.status !== "Coming Soon";
}

/** Recorded / on-demand catalog. Live workshops are online. */
export function isOfflineCourse(course: { status: CourseStatus }): boolean {
  return course.status === "Coming Soon";
}

export function hasCourseCover(coverImage: string | null | undefined): boolean {
  return Boolean(coverImage?.trim());
}
