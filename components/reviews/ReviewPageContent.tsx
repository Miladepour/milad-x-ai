"use client";

import { useTranslation } from "@/lib/i18n/useTranslation";
import type { ReviewProgramOption } from "@/lib/reviews/types";
import ReviewWizard from "./ReviewWizard";

interface ReviewPageContentProps {
  initialProgram?: ReviewProgramOption | null;
}

export default function ReviewPageContent({ initialProgram = null }: ReviewPageContentProps) {
  const t = useTranslation();
  const p = t.reviewPage;

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-8 sm:px-6">
      <div className="w-full max-w-md">
        <p className="font-mono text-[10px] uppercase tracking-widest text-orange mb-2 text-center">
          {p.label}
        </p>
        <h1 className="font-dm text-lg sm:text-xl font-semibold text-cream mb-2 text-center leading-snug">
          {p.title}
        </h1>
        <p className="font-dm text-sm text-cream/75 mb-6 text-center leading-relaxed">
          {p.description}
        </p>

        <ReviewWizard initialProgram={initialProgram} />
      </div>
    </div>
  );
}
