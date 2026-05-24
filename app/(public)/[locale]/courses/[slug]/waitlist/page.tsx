import WaitlistPage from "@/components/courses/WaitlistPage";
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

export default function CourseWaitlistPage({ params }: PageProps) {
  return <WaitlistPage courseSlug={params.slug} />;
}
