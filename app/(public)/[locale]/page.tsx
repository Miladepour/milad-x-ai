import Hero from "@/components/home/Hero";
import About from "@/components/home/About";
import AIWork from "@/components/home/AIWork";
import Courses from "@/components/home/Courses";
import BookCall from "@/components/home/BookCall";
import { getCourses } from "@/lib/courses/store";
import { urlLocaleToInternal, type UrlLocale } from "@/lib/i18n/config";

interface PageProps {
  params: { locale: string };
}

export const revalidate = 3600;

export default async function Home({ params }: PageProps) {
  const locale = urlLocaleToInternal(params.locale as UrlLocale);
  const courses = await getCourses(locale);

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
      <BookCall />
    </>
  );
}
