import type { Course } from "./types";
import type { CourseAdminPayload } from "./cms-types";
import { courseToAdminPayload } from "./validate";
import { promptToContentCourseEn } from "./data/en";
import { promptToContentCourseFa } from "./data/fa";
import { promptToWebsiteCourseEn } from "./data/prompt-to-website-en";
import { promptToWebsiteCourseFa } from "./data/prompt-to-website-fa";

function buildStaticCoursePayload(
  en: Course,
  fa: Course,
  sortOrder: number
): CourseAdminPayload {
  return {
    slug: en.slug,
    coverImage: en.coverImage,
    priceUsd: en.priceUsd,
    sortOrder,
    publishedAt: new Date().toISOString(),
    locales: {
      EN: courseToAdminPayload(en),
      FA: courseToAdminPayload(fa),
    },
  };
}

/** All courses defined in lib/courses/data — used for admin import and seeding. */
export function getAllStaticCourseAdminPayloads(): CourseAdminPayload[] {
  return [
    buildStaticCoursePayload(promptToContentCourseEn, promptToContentCourseFa, 0),
    buildStaticCoursePayload(promptToWebsiteCourseEn, promptToWebsiteCourseFa, 1),
  ];
}

/** @deprecated Use getAllStaticCourseAdminPayloads — first course only */
export function getStaticCourseAdminPayload(): CourseAdminPayload {
  return getAllStaticCourseAdminPayloads()[0]!;
}
