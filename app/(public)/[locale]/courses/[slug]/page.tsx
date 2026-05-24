import CourseDetail from "@/components/courses/CourseDetail";
import { courseSlugs, getCourseBySlug } from "@/lib/courses";
import { locales, urlLocaleToInternal, type UrlLocale } from "@/lib/i18n/config";
import { pageAlternates } from "@/lib/i18n/metadata";
import type { Metadata } from "next";

interface PageProps {
  params: { locale: string; slug: string };
}

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    courseSlugs.map((slug) => ({ locale, slug }))
  );
}

export function generateMetadata({ params }: PageProps): Metadata {
  const locale = params.locale as UrlLocale;
  const internal = urlLocaleToInternal(locale);
  const course = getCourseBySlug(params.slug, internal);

  if (!course) {
    return { title: internal === "FA" ? "دوره‌ها" : "Courses" };
  }

  return {
    title: course.listTitle,
    description: course.excerpt,
    alternates: pageAlternates(`/courses/${params.slug}`, locale),
  };
}

export default function CourseDetailPage({ params }: PageProps) {
  return <CourseDetail slug={params.slug} />;
}
