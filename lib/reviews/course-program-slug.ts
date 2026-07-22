/** Member program slug for reviews when it differs from the marketing course slug. */
export const REVIEW_PROGRAM_SLUG_BY_COURSE: Record<string, string> = {
  "prompt-to-website": "program-a8371f65",
};

export function reviewProgramSlugForCourse(courseSlug: string): string {
  return REVIEW_PROGRAM_SLUG_BY_COURSE[courseSlug] ?? courseSlug;
}
