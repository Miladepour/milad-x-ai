"use client";

import Link from "next/link";
import { COURSES_BASE_PATH, getCourses } from "@/lib/courses";
import { useLanguage } from "@/lib/i18n/context";
import { useTranslation } from "@/lib/i18n/useTranslation";
import CourseCard from "./CourseCard";

export default function CoursesListing() {
  const { lang } = useLanguage();
  const t = useTranslation();
  const courses = getCourses(lang);
  const p = t.coursesPage;

  return (
    <div className="flex-1 w-full bg-background text-cream">
      <div className="max-w-6xl mx-auto px-8 md:px-12 lg:px-16 pt-32 pb-24">
        <Link
          href="/"
          className="font-dm text-sm text-muted hover:text-cream transition-colors mb-10 inline-block"
        >
          {p.backHome}
        </Link>

        <p className="type-section-label font-mono text-orange mb-3">{p.label}</p>
        <h1 className="type-course-page-title font-dm font-bold text-cream mb-4">
          {p.title}
        </h1>
        <p className="type-section-body font-dm text-cream max-w-2xl mb-14 leading-relaxed">
          {p.description}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map((course) => (
            <CourseCard key={course.slug} course={course} />
          ))}
        </div>
      </div>
    </div>
  );
}
