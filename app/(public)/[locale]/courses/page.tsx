import CoursesListing from "@/components/courses/CoursesListing";
import { getCourses } from "@/lib/courses/store";
import { urlLocaleToInternal, type UrlLocale } from "@/lib/i18n/config";

interface PageProps {
  params: { locale: string };
}

export const revalidate = 3600;

export default async function CoursesPage({ params }: PageProps) {
  const locale = urlLocaleToInternal(params.locale as UrlLocale);
  const courses = await getCourses(locale);
  return <CoursesListing courses={courses} />;
}
