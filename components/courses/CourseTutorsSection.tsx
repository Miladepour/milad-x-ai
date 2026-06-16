"use client";

import Image from "next/image";
import type { Course } from "@/lib/courses";
import { INSTRUCTOR_PORTRAIT_SRC } from "@/lib/instructor/constants";
import { useTranslation } from "@/lib/i18n/useTranslation";
import type { Locale } from "@/lib/i18n/translations";

function tutorPortraitSrc(tutor: { portraitSrc?: string } | null | undefined) {
  if (tutor?.portraitSrc) return tutor.portraitSrc;
  return INSTRUCTOR_PORTRAIT_SRC;
}

function tutorHeading(label: string, name: string) {
  return (
    <>
      <span className="uppercase">{label}</span>
      <span> : {name}</span>
    </>
  );
}

export default function CourseTutorsSection({
  course,
  title,
  lang,
}: {
  course: Course;
  title: string;
  lang: Locale;
}) {
  const t = useTranslation();
  const miladAbout = t.instructorAbout;
  const additionalTutors = course.meta.tutors ?? [];
  const miladHeading = tutorHeading(title, course.meta.instructor);
  const miladHeadingText = `${title} : ${course.meta.instructor}`;

  return (
    <section id="instructor" className="pt-12 border-t border-surface scroll-mt-28">
      <div className="space-y-14">
        <div className="flex flex-col md:flex-row gap-10 md:gap-12 items-start">
          <div className="relative w-full max-w-[280px] mx-auto md:mx-0 aspect-[3/4] shrink-0 overflow-hidden rounded-sm border border-surface bg-surface">
            <Image
              src={INSTRUCTOR_PORTRAIT_SRC}
              alt={miladHeadingText}
              fill
              className="object-cover object-top"
              sizes="(max-width: 768px) 280px, 280px"
            />
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="font-mono text-xs text-orange tracking-widest rtl:tracking-normal mb-4">
              {miladHeading}
            </h2>
            <div className="space-y-4 font-dm text-cream/85 leading-relaxed max-w-2xl">
              {miladAbout.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>

        {additionalTutors.map((tutor, idx) => {
          const heading = tutorHeading(title, tutor.name[lang]);
          const headingText = `${title} : ${tutor.name[lang]}`;

          return (
          <div key={`${tutor.portraitSrc}-${idx}`} className="flex flex-col md:flex-row gap-10 md:gap-12 items-start">
            <div className="relative w-full max-w-[280px] mx-auto md:mx-0 aspect-[3/4] shrink-0 overflow-hidden rounded-sm border border-surface bg-surface">
              <Image
                src={tutorPortraitSrc(tutor)}
                alt={headingText}
                fill
                className="object-cover object-top"
                sizes="(max-width: 768px) 280px, 280px"
              />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-mono text-xs text-orange tracking-widest rtl:tracking-normal mb-4">
                {heading}
              </h3>
              <div className="space-y-4 font-dm text-cream/85 leading-relaxed max-w-2xl">
                {tutor.about[lang].map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>
          </div>
          );
        })}
      </div>
    </section>
  );
}

