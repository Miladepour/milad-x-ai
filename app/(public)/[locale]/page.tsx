import { unstable_noStore as noStore } from "next/cache";
import Hero from "@/components/home/Hero";
import About from "@/components/home/About";
import AIWork from "@/components/home/AIWork";
import Courses from "@/components/home/Courses";
import StudentReviews from "@/components/home/StudentReviews";
import BookCall from "@/components/home/BookCall";
import { getCourses } from "@/lib/courses/store";
import { listPublicProgramReviews } from "@/lib/reviews/store";
import { urlLocaleToInternal, type UrlLocale } from "@/lib/i18n/config";

interface PageProps {
  params: { locale: string };
}

export default async function Home({ params }: PageProps) {
  noStore();
  const locale = urlLocaleToInternal(params.locale as UrlLocale);
  const [courses, reviews] = await Promise.all([
    getCourses(locale),
    listPublicProgramReviews({ locale, limit: 8 }),
  ]);

  return (
    <>
      <Hero />
      <div id="about">
        <About />
      </div>
      <div id="work">
        <AIWork />
      </div>
      <div id="courses">
        <Courses courses={courses} />
      </div>
      {reviews.length > 0 ? <StudentReviews reviews={reviews} /> : null}
      <BookCall />
    </>
  );
}
