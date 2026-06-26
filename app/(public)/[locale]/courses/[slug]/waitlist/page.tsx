import WaitlistPage from "@/components/courses/WaitlistPage";
import { getCourseApplyUrl } from "@/lib/courses/registration";
import { getAllCourseSlugs, getCourseBySlug } from "@/lib/courses/store";
import { locales, urlLocaleToInternal, type UrlLocale } from "@/lib/i18n/config";
import { pageAlternates } from "@/lib/i18n/metadata";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

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
    return { title: internal === "FA" ? "لیست انتظار" : "Waiting list" };
  }

  const titlePrefix =
    internal === "FA"
      ? `ثبت‌نام در لیست انتظار — ${course.listTitle}`
      : `Join waiting list — ${course.listTitle}`;

  return {
    title: titlePrefix,
    description: course.excerpt,
    alternates: pageAlternates(`/courses/${params.slug}/waitlist`, locale),
  };
}

export default async function CourseWaitlistPage({ params }: PageProps) {
  const locale = urlLocaleToInternal(params.locale as UrlLocale);
  const course = await getCourseBySlug(params.slug, locale);
  if (!course) notFound();

  const applyUrl = getCourseApplyUrl(course);
  if (applyUrl) redirect(applyUrl);

  return <WaitlistPage course={course} />;
}
