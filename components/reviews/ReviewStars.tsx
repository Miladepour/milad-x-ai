"use client";

import { toLocaleDigits } from "@/lib/i18n/digits";
import type { Locale } from "@/lib/i18n/translations";

interface ReviewStarsProps {
  rating: number;
  lang: Locale;
  /** Accessible label, e.g. "4 out of 5" */
  ratingLabel: string;
  className?: string;
}

export default function ReviewStars({
  rating,
  lang,
  ratingLabel,
  className = "",
}: ReviewStarsProps) {
  const rounded = Math.min(5, Math.max(1, Math.round(rating)));

  return (
    <div
      className={`flex items-center gap-2 ${className}`}
      role="img"
      aria-label={ratingLabel}
    >
      <span className="inline-flex gap-0.5 text-orange" aria-hidden>
        {Array.from({ length: 5 }, (_, index) => (
          <span
            key={index}
            className={`text-base leading-none ${index < rounded ? "opacity-100" : "opacity-25"}`}
          >
            ★
          </span>
        ))}
      </span>
      <span className="font-mono text-xs text-cream/70 tabular-nums">
        {toLocaleDigits(`${rounded}/5`, lang)}
      </span>
    </div>
  );
}
