import { revalidatePath } from "next/cache";

export function revalidateCoursePaths(slug: string) {
  const paths = [
    "/",
    "/courses",
    `/courses/${slug}`,
    `/courses/${slug}/waitlist`,
    "/en",
    "/en/courses",
    `/en/courses/${slug}`,
    `/en/courses/${slug}/waitlist`,
    "/fa",
    "/fa/courses",
    `/fa/courses/${slug}`,
    `/fa/courses/${slug}/waitlist`,
  ];

  for (const path of paths) {
    revalidatePath(path);
  }
}
