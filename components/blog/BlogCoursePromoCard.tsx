"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { COURSES_BASE_PATH } from "@/lib/courses";
import { getCourseApplyUrl } from "@/lib/courses/registration";
import { getRegistrationDeadlineMs } from "@/lib/courses/session-datetime";
import type { Course } from "@/lib/courses/types";
import type { UrlLocale } from "@/lib/i18n/config";
import { localizedPath } from "@/lib/i18n/paths";
import { translations } from "@/lib/i18n/translations";
import { toLocaleDigits } from "@/lib/i18n/digits";
import RegistrationDeadlineCountdown from "@/components/courses/RegistrationDeadlineCountdown";

interface BlogCoursePromoCardProps {
  course: Course;
  locale: UrlLocale;
  intro?: string;
}

export default function BlogCoursePromoCard({
  course,
  locale,
  intro,
}: BlogCoursePromoCardProps) {
  const lang = locale === "fa" ? "FA" : "EN";
  const labels = translations[lang].coursesPage;
  const detail = labels.detail;
  const courseHref = localizedPath(`${COURSES_BASE_PATH}/${course.slug}`, locale);
  const applyUrl = getCourseApplyUrl(course);
  const session1 = course.meta.sessions[0];

  const deadlineMs = useMemo(() => {
    if (course.status !== "Live" || !session1) return null;
    return getRegistrationDeadlineMs(session1.date, session1.time, course.meta.timezone);
  }, [course.status, course.meta.timezone, session1?.date, session1?.time]);

  const defaultIntro =
    lang === "FA"
      ? "اگر می‌خواهید حرفه‌ای‌تر با هوش مصنوعی محتوا تولید کنید — از ایده تا تصویر، ویدیو و اتوماتیک‌سازی — ورکشاپ تولید محتوا با AI ما را از دست ندهید."
      : "Want to go deeper into AI content creation — from ideas to images, video, and automation? Join our Prompt to Content workshop.";

  const introText = intro ?? defaultIntro;

  return (
    <div className="my-8">
      {introText ? (
        <p className="mb-4 font-dm text-sm leading-relaxed text-cream/85 md:text-base">
          {introText}
        </p>
      ) : null}

      <aside className="overflow-hidden rounded-sm border border-orange/25 bg-surface/40">
        <div className="grid gap-0 sm:grid-cols-[140px_minmax(0,1fr)]">
          <div className="relative h-36 sm:h-full sm:min-h-[180px]">
            <Image
              src={course.coverImage}
              alt={course.listTitle}
              fill
              className="object-cover"
              sizes="140px"
            />
          </div>

          <div className="flex flex-col gap-3 p-4">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-widest text-orange rtl:tracking-normal">
                {labels.statusLabels[course.status]}
              </p>
              <h3 className="mt-1 font-dm text-base font-semibold leading-snug text-cream">
                {course.listTitle}
              </h3>
              <p className="mt-1 font-dm text-xs text-cream/65">
                {labels.dateLabel}: {toLocaleDigits(course.date, lang)}
              </p>
            </div>

            {deadlineMs != null && course.status === "Live" ? (
              <RegistrationDeadlineCountdown
                deadlineMs={deadlineMs}
                lang={lang}
                labels={{
                  title: detail.registrationDeadline,
                  closed: detail.registrationClosed,
                  days: detail.countdownDays,
                  hours: detail.countdownHours,
                  minutes: detail.countdownMinutes,
                  seconds: detail.countdownSeconds,
                }}
              />
            ) : null}

            <div className="flex flex-col gap-2 sm:flex-row">
              {applyUrl ? (
                <a
                  href={applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-1 items-center justify-center rounded-sm bg-orange px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-background transition-colors hover:bg-cream"
                >
                  {labels.applyNow}
                </a>
              ) : (
                <Link
                  href={courseHref}
                  className="flex flex-1 items-center justify-center rounded-sm bg-orange px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-background transition-colors hover:bg-cream"
                >
                  {labels.applyNow}
                </Link>
              )}
              <Link
                href={courseHref}
                className="flex flex-1 items-center justify-center rounded-sm border border-orange/50 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-orange transition-colors hover:bg-orange hover:text-background"
              >
                {labels.viewDetails}
              </Link>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
