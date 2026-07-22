"use client";

import type { PublicProgramReview } from "@/lib/reviews/types";
import { useLanguage } from "@/lib/i18n/context";
import { useTranslation } from "@/lib/i18n/useTranslation";
import PortfolioCarousel from "@/components/portfolio/PortfolioCarousel";
import ReviewStudentGlassCard from "@/components/reviews/ReviewStudentGlassCard";

interface StudentReviewsSectionProps {
  reviews: PublicProgramReview[];
  /** Full-width band (home / courses index). Embedded fits course detail column. */
  variant?: "page" | "embedded";
  hideProgramLink?: boolean;
  sectionId?: string;
  className?: string;
}

export default function StudentReviewsSection({
  reviews,
  variant = "page",
  hideProgramLink = false,
  sectionId = "student-reviews",
  className = "",
}: StudentReviewsSectionProps) {
  const t = useTranslation();
  const p = t.studentReviews;
  const { lang } = useLanguage();

  if (reviews.length === 0) return null;

  const labels = {
    ratingLabel: p.ratingLabel,
    coursePrefix: p.coursePrefix,
    verifiedStudent: p.verifiedStudent,
  };

  const headingId = `${sectionId}-heading`;

  const inner = (
    <>
      <header className="max-w-2xl">
        <span className="type-section-label font-mono text-orange uppercase tracking-[0.35em] rtl:tracking-normal block mb-3">
          {p.label}
        </span>
        <h2
          id={headingId}
          className="type-course-page-title font-dm font-bold text-cream leading-tight m-0"
        >
          {p.heading}
        </h2>
      </header>

      <PortfolioCarousel
        ariaLabel={p.carouselAria}
        prevLabel={p.scrollPrev}
        nextLabel={p.scrollNext}
        rtl={lang === "FA"}
      >
        {reviews.map((review) => (
          <ReviewStudentGlassCard
            key={review.id}
            review={review}
            ratingLabelTemplate={labels.ratingLabel}
            coursePrefix={labels.coursePrefix}
            verifiedStudentLabel={labels.verifiedStudent}
            hideProgramLink={hideProgramLink}
          />
        ))}
      </PortfolioCarousel>
    </>
  );

  if (variant === "embedded") {
    return (
      <section
        id={sectionId}
        className={`flex flex-col gap-8 min-w-0 ${className}`.trim()}
        aria-labelledby={headingId}
      >
        {inner}
      </section>
    );
  }

  return (
    <section
      id={sectionId}
      className={`w-full bg-background pt-10 md:pt-12 pb-28 px-8 md:px-12 lg:px-16 border-t border-surface/80 ${className}`.trim()}
      aria-labelledby={headingId}
    >
      <div className="max-w-6xl mx-auto flex flex-col gap-8">{inner}</div>
    </section>
  );
}
