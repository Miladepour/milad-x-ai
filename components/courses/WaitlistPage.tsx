"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { COURSES_BASE_PATH, getCourseBySlug } from "@/lib/courses";
import { useLanguage } from "@/lib/i18n/context";
import { useTranslation } from "@/lib/i18n/useTranslation";
import WaitlistForm from "./WaitlistForm";

interface WaitlistPageProps {
  courseSlug: string;
}

export default function WaitlistPage({ courseSlug }: WaitlistPageProps) {
  const { lang, href } = useLanguage();
  const t = useTranslation();
  const p = t.coursesPage;
  const course = getCourseBySlug(courseSlug, lang);

  if (!course) notFound();

  const coursePath = href(`${COURSES_BASE_PATH}/${course.slug}`);

  return (
    <div
      dir={lang === "FA" ? "rtl" : "ltr"}
      lang={lang === "FA" ? "fa" : "en"}
      className="flex-1 w-full bg-background text-cream"
    >
      <div className="max-w-2xl mx-auto px-8 md:px-12 lg:px-16 pt-32 pb-24">
        <nav className="flex flex-wrap items-center gap-2 text-sm font-dm text-muted mb-10">
          <Link href={href("/")} className="hover:text-cream transition-colors">
            {p.home}
          </Link>
          <span aria-hidden>/</span>
          <Link
            href={href(COURSES_BASE_PATH)}
            className="hover:text-cream transition-colors"
          >
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
