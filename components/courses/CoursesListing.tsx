"use client";

import Link from "next/link";
import type { Course } from "@/lib/courses";
import { useLanguage } from "@/lib/i18n/context";
import { useTranslation } from "@/lib/i18n/useTranslation";
import ConsultationCtaBanner from "@/components/shared/ConsultationCtaBanner";
import StudentReviewsSection from "@/components/reviews/StudentReviewsSection";
import CourseCard from "./CourseCard";
import type { PublicProgramReview } from "@/lib/reviews/types";

interface CoursesListingProps {
  courses: Course[];
  reviews: PublicProgramReview[];
}

export default function CoursesListing({ courses, reviews }: CoursesListingProps) {
  const { href } = useLanguage();
  const t = useTranslation();
  const p = t.coursesPage;

  return (
    <div className="flex-1 w-full bg-background text-cream">
      <div className="max-w-6xl mx-auto px-8 md:px-12 lg:px-16 pt-32 pb-24">
        <Link
          href={href("/")}
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

        {reviews.length > 0 ? (
          <StudentReviewsSection
            reviews={reviews}
            variant="embedded"
            className="mt-14 md:mt-16 pt-10 border-t border-surface/80"
          />
        ) : null}

        <ConsultationCtaBanner embedded className="mt-14 md:mt-16" />
      </div>
    </div>
  );
}
