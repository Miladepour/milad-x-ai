import CourseDetail from "@/components/courses/CourseDetail";
import { isCourseOpenable } from "@/lib/courses";
import { getAllCourseSlugs, getCourseBySlug, getCourses } from "@/lib/courses/store";
import { listPublicProgramReviewsForCourse } from "@/lib/reviews/store";
import { locales, urlLocaleToInternal, type UrlLocale } from "@/lib/i18n/config";
import { pageAlternates } from "@/lib/i18n/metadata";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

interface PageProps {
  params: { locale: string; slug: string };
}

export const revalidate = 3600;

export async function generateStaticParams() {
  const [slugs, courses] = await Promise.all([getAllCourseSlugs(), getCourses("EN")]);
  const blocked = new Set(
    courses.filter((course) => !isCourseOpenable(course)).map((course) => course.slug)
  );
  const publicSlugs = slugs.filter((slug) => !blocked.has(slug));
  return locales.flatMap((locale) => publicSlugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale = params.locale as UrlLocale;
  const internal = urlLocaleToInternal(locale);
  const course = await getCourseBySlug(params.slug, internal);

  if (!course) {
    return { title: internal === "FA" ? "دوره‌ها" : "Courses" };
  }

  if (!isCourseOpenable(course)) {
    return { title: course.listTitle };
  }

  return {
    title: course.listTitle,
    description: course.excerpt,
    alternates: pageAlternates(`/courses/${params.slug}`, locale),
  };
}

export default async function CourseDetailPage({ params }: PageProps) {
  const locale = urlLocaleToInternal(params.locale as UrlLocale);
  const [course, reviews] = await Promise.all([
    getCourseBySlug(params.slug, locale),
    listPublicProgramReviewsForCourse({ locale, courseSlug: params.slug, limit: 12 }),
  ]);
  if (!course || !isCourseOpenable(course)) notFound();
  return <CourseDetail course={course} reviews={reviews} />;
}
