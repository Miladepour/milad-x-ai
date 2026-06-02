"use client";

import Image from "next/image";
import { INSTRUCTOR_PORTRAIT_SRC } from "@/lib/instructor/constants";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface InstructorAboutSectionProps {
  id?: string;
  className?: string;
  /** Defaults to instructorAbout.title (e.g. "About Milad") */
  title?: string;
}

export default function InstructorAboutSection({
  id = "instructor",
  className = "",
  title,
}: InstructorAboutSectionProps) {
  const t = useTranslation();
  const about = t.instructorAbout;
  const heading = title ?? about.title;

  return (
    <section
      id={id}
      className={`pt-12 border-t border-surface scroll-mt-28 ${className}`.trim()}
    >
      <div className="flex flex-col md:flex-row gap-10 md:gap-12 items-start">
        <div className="relative w-full max-w-[280px] mx-auto md:mx-0 aspect-[3/4] shrink-0 overflow-hidden rounded-sm border border-surface bg-surface">
          <Image
            src={INSTRUCTOR_PORTRAIT_SRC}
            alt={heading}
            fill
            className="object-cover object-top"
            sizes="(max-width: 768px) 280px, 280px"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-mono text-xs text-orange uppercase tracking-widest rtl:tracking-normal mb-4">
            {heading}
          </h2>
          <div className="space-y-4 font-dm text-cream/85 leading-relaxed max-w-2xl">
            {about.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
