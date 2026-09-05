import { unstable_noStore as noStore } from "next/cache";
import Hero from "@/components/home/Hero";
import TrustStrip from "@/components/home/TrustStrip";
import LearningPaths from "@/components/home/LearningPaths";
import About from "@/components/home/About";
import AIWork from "@/components/home/AIWork";
import Courses from "@/components/home/Courses";
import StudentReviews from "@/components/home/StudentReviews";
import FreeTutorials from "@/components/home/FreeTutorials";
import BookCall from "@/components/home/BookCall";
import { getCourses } from "@/lib/courses/store";
import { listPublicProgramReviews } from "@/lib/reviews/store";
import { getTutorials } from "@/lib/tutorials/data";
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
  const courseReferenceTimestamp = Date.now();
  const tutorials = getTutorials(locale).slice(0, 3);

  return (
    <>
      <Hero />
      <TrustStrip />
      <LearningPaths />
      <div id="courses">
        <Courses courses={courses} referenceTimestamp={courseReferenceTimestamp} />
      </div>
      <AIWork />
      {reviews.length > 0 ? <StudentReviews reviews={reviews} /> : null}
      <FreeTutorials tutorials={tutorials} />
      <div id="about">
        <About />
      </div>
      <BookCall />
    </>
  );
}
