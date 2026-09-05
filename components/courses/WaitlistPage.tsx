"use client";

import type { Course } from "@/lib/courses";
import { COURSES_BASE_PATH } from "@/lib/courses";
import { useLanguage } from "@/lib/i18n/context";
import { useTranslation } from "@/lib/i18n/useTranslation";
import PageBreadcrumb from "@/components/layout/PageBreadcrumb";
import WaitlistForm from "./WaitlistForm";

interface WaitlistPageProps {
  course: Course;
}

export default function WaitlistPage({ course }: WaitlistPageProps) {
  const { lang, href } = useLanguage();
  const t = useTranslation();
  const p = t.coursesPage;

  const coursePath = href(`${COURSES_BASE_PATH}/${course.slug}`);

  return (
    <div
      dir={lang === "FA" ? "rtl" : "ltr"}
      lang={lang === "FA" ? "fa" : "en"}
      className="flex-1 w-full bg-background text-cream"
    >
      <div className="max-w-2xl mx-auto px-8 md:px-12 lg:px-16 pt-32 pb-24">
        <PageBreadcrumb
          ariaLabel={t.navbar.breadcrumbAria}
          className="mb-10"
          items={[
            { label: p.home, href: href("/") },
            { label: p.courses, href: href(COURSES_BASE_PATH) },
            { label: course.listTitle, href: coursePath },
            { label: p.applyNow },
          ]}
        />

        <WaitlistForm course={course} />
      </div>
    </div>
  );
}
