import CoursesListing from "@/components/courses/CoursesListing";
import { getCourses } from "@/lib/courses/store";
import { listPublicProgramReviews } from "@/lib/reviews/store";
import { urlLocaleToInternal, type UrlLocale } from "@/lib/i18n/config";

interface PageProps {
  params: { locale: string };
}

export const revalidate = 3600;

export default async function CoursesPage({ params }: PageProps) {
  const locale = urlLocaleToInternal(params.locale as UrlLocale);
  const [courses, reviews] = await Promise.all([
    getCourses(locale),
    listPublicProgramReviews({ locale, limit: 12 }),
  ]);
  return <CoursesListing courses={courses} reviews={reviews} />;
}
