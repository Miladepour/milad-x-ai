import CourseDetail from "@/components/courses/CourseDetail";
import { getAllCourseSlugs, getCourseBySlug } from "@/lib/courses/store";
import { locales, urlLocaleToInternal, type UrlLocale } from "@/lib/i18n/config";
import { pageAlternates } from "@/lib/i18n/metadata";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

interface PageProps {
  params: { locale: string; slug: string };
}

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await getAllCourseSlugs();
  return locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale = params.locale as UrlLocale;
  const internal = urlLocaleToInternal(locale);
  const course = await getCourseBySlug(params.slug, internal);

  if (!course) {
    return { title: internal === "FA" ? "دوره‌ها" : "Courses" };
  }

  return {
    title: course.listTitle,
    description: course.excerpt,
    alternates: pageAlternates(`/courses/${params.slug}`, locale),
  };
}

export default async function CourseDetailPage({ params }: PageProps) {
  const locale = urlLocaleToInternal(params.locale as UrlLocale);
  const course = await getCourseBySlug(params.slug, locale);
  if (!course) notFound();
  return <CourseDetail course={course} />;
}
