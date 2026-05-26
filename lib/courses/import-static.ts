import type { CourseAdminPayload } from "./cms-types";
import { courseToAdminPayload } from "./validate";
import { promptToContentCourseEn } from "./data/en";
import { promptToContentCourseFa } from "./data/fa";

export function getStaticCourseAdminPayload(): CourseAdminPayload {
  const en = promptToContentCourseEn;
  const fa = promptToContentCourseFa;

  return {
    slug: en.slug,
    coverImage: en.coverImage,
    priceUsd: en.priceUsd,
    sortOrder: 0,
    publishedAt: new Date().toISOString(),
    locales: {
      EN: courseToAdminPayload(en),
      FA: courseToAdminPayload(fa),
    },
  };
}
