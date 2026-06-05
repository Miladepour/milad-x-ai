"use client";

import Link from "next/link";
import { COURSES_BASE_PATH } from "@/lib/courses";
import { useLanguage } from "@/lib/i18n/context";
import { useTranslation } from "@/lib/i18n/useTranslation";
import AiLearnIllustration from "./AiLearnIllustration";

interface TutorialsCtaBannerProps {
  className?: string;
}

export default function TutorialsCtaBanner({
  className = "",
}: TutorialsCtaBannerProps) {
  const { href } = useLanguage();
  const p = useTranslation().tutorialsPage;

  return (
    <section
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#FFB800] via-orange to-[#E84D00] p-8 sm:p-10 md:p-12 shadow-[0_16px_40px_rgba(255,92,0,0.28)] ${className}`}
    >
      <div
        className="pointer-events-none absolute -top-10 -end-10 h-40 w-40 rounded-full bg-white/15 blur-2xl"
        aria-hidden
      />
      <div className="relative grid grid-cols-1 md:grid-cols-[minmax(200px,280px)_1fr] gap-8 md:gap-10 lg:gap-12 items-center">
        <div className="flex items-center justify-center md:justify-center">
          <AiLearnIllustration />
        </div>
        <div className="flex flex-col justify-center text-center md:text-start gap-4 md:gap-5 md:py-1">
          <h2 className="type-course-section-heading font-dm font-bold text-background">
            {p.ctaTitle}
          </h2>
          <p className="type-section-body font-dm text-background/85 leading-relaxed max-w-xl mx-auto md:mx-0">
            {p.ctaDescription}
          </p>
          <Link
            href={href(COURSES_BASE_PATH)}
            className="inline-flex items-center justify-center self-center md:self-start font-dm font-semibold px-8 py-3.5 text-sm bg-background text-cream rounded-full hover:bg-background/90 transition-colors duration-200 shadow-[0_8px_20px_rgba(13,13,13,0.25)]"
          >
            {p.ctaButton}
          </Link>
        </div>
      </div>
    </section>
  );
}
