import { getCourses } from "@/lib/courses/store";
import type { UrlLocale } from "@/lib/i18n/config";
import BlogCoursePromoCard from "@/components/blog/BlogCoursePromoCard";

interface BlogCoursePromoProps {
  locale: UrlLocale;
  courseSlug?: string;
}

export default async function BlogCoursePromo({
  locale,
  courseSlug = "prompt-to-content",
}: BlogCoursePromoProps) {
  const courses = (await getCourses("FA")).filter(
    (course) => course.status !== "Closed" && course.slug === courseSlug
  );

  if (courses.length === 0) return null;

  return (
    <div className="my-2">
      {courses.map((course) => (
        <BlogCoursePromoCard key={course.slug} course={course} locale={locale} />
      ))}
    </div>
  );
}
