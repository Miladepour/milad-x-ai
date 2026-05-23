"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { COURSES_BASE_PATH, getCourseBySlug } from "@/lib/courses";
import { translations } from "@/lib/i18n/translations";
import WaitlistForm from "./WaitlistForm";

const p = translations.EN.coursesPage;

interface WaitlistPageProps {
  courseSlug: string;
}

export default function WaitlistPage({ courseSlug }: WaitlistPageProps) {
  const course = getCourseBySlug(courseSlug, "EN");

  if (!course) notFound();

  const coursePath = `${COURSES_BASE_PATH}/${course.slug}`;

  return (
    <div dir="ltr" lang="en" className="flex-1 w-full bg-background text-cream">
      <div className="max-w-2xl mx-auto px-8 md:px-12 lg:px-16 pt-32 pb-24">
        <nav className="flex flex-wrap items-center gap-2 text-sm font-dm text-muted mb-10">
          <Link href="/" className="hover:text-cream transition-colors">
            {p.home}
          </Link>
          <span aria-hidden>/</span>
          <Link href={COURSES_BASE_PATH} className="hover:text-cream transition-colors">
            {p.courses}
          </Link>
          <span aria-hidden>/</span>
          <Link href={coursePath} className="hover:text-cream transition-colors">
            {course.listTitle}
          </Link>
        </nav>

        <WaitlistForm courseSlug={courseSlug} />
      </div>
    </div>
  );
}
