import CoursesListing from "@/components/courses/CoursesListing";
import CoursesPageJsonLd from "@/components/courses/CoursesPageJsonLd";
import { getCourses } from "@/lib/courses/store";
import { getPageHeroSrc } from "@/lib/pages/hero";
import { listPublicProgramReviews } from "@/lib/reviews/store";
import { urlLocaleToInternal, type UrlLocale } from "@/lib/i18n/config";

interface PageProps {
  params: { locale: string };
}

export const revalidate = 3600;

export default async function CoursesPage({ params }: PageProps) {
  const locale = params.locale as UrlLocale;
  const internal = urlLocaleToInternal(locale);
  const [courses, reviews] = await Promise.all([
    getCourses(internal),
    listPublicProgramReviews({ locale: internal, limit: 12 }),
  ]);
  return (
    <>
      <CoursesPageJsonLd locale={locale} courses={courses} />
      <CoursesListing
        courses={courses}
        reviews={reviews}
        heroSrc={getPageHeroSrc("courses", locale)}
      />
    </>
  );
}
