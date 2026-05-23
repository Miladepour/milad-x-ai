import CourseDetail from "@/components/courses/CourseDetail";
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
  if (!course) return { title: "Courses | Milad X AI" };

  return {
    title: `${course.listTitle} | Milad X AI`,
    description: course.excerpt,
  };
}

export default function CourseDetailPage({ params }: PageProps) {
  return <CourseDetail slug={params.slug} />;
}
