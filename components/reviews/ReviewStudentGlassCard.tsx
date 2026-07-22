"use client";

import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import type { PublicProgramReview } from "@/lib/reviews/types";
import { COURSES_BASE_PATH } from "@/lib/courses";
import { toLocaleDigits } from "@/lib/i18n/digits";
import { useLanguage } from "@/lib/i18n/context";

interface ReviewStudentGlassCardProps {
  review: PublicProgramReview;
  ratingLabelTemplate: string;
  coursePrefix: string;
  verifiedStudentLabel: string;
  hideProgramLink?: boolean;
}

export default function ReviewStudentGlassCard({
  review,
  ratingLabelTemplate,
  coursePrefix,
  verifiedStudentLabel,
  hideProgramLink = false,
}: ReviewStudentGlassCardProps) {
  const { lang, href } = useLanguage();
  const isRtl = lang === "FA";
  const roundedRating = Math.min(5, Math.max(1, Math.round(review.rating)));
  const ratingScore = toLocaleDigits(`${roundedRating}/5`, lang);
  const ratingAria = toLocaleDigits(
    ratingLabelTemplate.replace("{rating}", String(roundedRating)),
    lang
  );

  const courseHref =
    review.programSlug.length > 0
      ? href(`${COURSES_BASE_PATH}/${review.programSlug}`)
      : null;

  return (
    <article
      dir={isRtl ? "rtl" : "ltr"}
      className="review-glass-card flex-shrink-0 w-[min(calc(100vw-4rem),360px)] md:w-[360px] snap-start flex flex-col min-h-[300px]"
    >
      <div
        className="pointer-events-none absolute -top-10 -end-8 h-32 w-32 rounded-full bg-orange/20 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-12 -start-6 h-28 w-28 rounded-full bg-white/10 blur-3xl"
        aria-hidden
      />

      <div className="relative flex flex-col flex-1 gap-4 w-full text-start">
        <header className="flex w-full items-center justify-between gap-3 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <h3 className="type-card-body font-dm font-semibold text-cream truncate m-0">
              {review.reviewerName}
            </h3>
            <span
              className="inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-[#3B82F6] text-white shadow-[0_0_12px_rgba(59,130,246,0.45)]"
              title={verifiedStudentLabel}
            >
              <BadgeCheck className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
              <span className="sr-only">{verifiedStudentLabel}</span>
            </span>
          </div>

          <div
            className="flex items-center gap-1.5 shrink-0 font-dm font-semibold text-cream tabular-nums"
            role="img"
            aria-label={ratingAria}
          >
            <span className="text-orange text-base leading-none" aria-hidden>
              ★
            </span>
            <span dir="ltr" className="inline-block">
              {ratingScore}
            </span>
          </div>
        </header>

        <blockquote className="flex-1 m-0 w-full">
          <p className="type-card-body font-dm text-cream/90 leading-relaxed line-clamp-6 text-start [unicode-bidi:plaintext]">
            {review.publicReview}
          </p>
        </blockquote>

        {review.programTitle && !hideProgramLink ? (
          <footer className="w-full border-t border-white/[0.1] pt-4 mt-auto text-start">
            {courseHref ? (
              <Link
                href={courseHref}
                className="font-dm text-sm leading-snug line-clamp-2 hover:opacity-90 transition-opacity"
              >
                <span className="text-cream/50">{coursePrefix} </span>
                <span className="font-semibold text-orange">{review.programTitle}</span>
              </Link>
            ) : (
              <p className="font-dm text-sm leading-snug line-clamp-2 m-0">
                <span className="text-cream/50">{coursePrefix} </span>
                <span className="font-semibold text-orange">{review.programTitle}</span>
              </p>
            )}
          </footer>
        ) : null}
      </div>
    </article>
  );
}
