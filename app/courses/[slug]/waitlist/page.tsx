import WaitlistPage from "@/components/courses/WaitlistPage";
import { courseSlugs, getCourseBySlug } from "@/lib/courses";
import type { Metadata } from "next";

interface PageProps {
  params: { slug: string };
}

export function generateStaticParams() {
  return courseSlugs.map((slug) => ({ slug }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const course = getCourseBySlug(params.slug, "EN");
  if (!course) return { title: "Waiting list | Milad X AI" };

  return {
    title: `Join waiting list — ${course.listTitle} | Milad X AI`,
    description: course.excerpt,
  };
}

export default function CourseWaitlistPage({ params }: PageProps) {
  return <WaitlistPage courseSlug={params.slug} />;
}
