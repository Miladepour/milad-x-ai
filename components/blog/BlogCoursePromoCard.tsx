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
      ? "اگر می‌خواهید حرفه‌ای‌تر با هوش مصنوعی محتوا تولید کنید، از ایده تا تصویر، ویدیو و اتوماتیک‌سازی، ورکشاپ تولید محتوا با AI ما را از دست ندهید."
      : "Want to go deeper into AI content creation, from ideas to images, video, and automation? Join our Prompt to Content workshop.";

  const introText = intro ?? defaultIntro;

  return (
    <div className="my-10">
      {introText ? (
        <p className="mb-5 text-center font-dm text-sm leading-relaxed text-cream/85 md:text-base">
          {introText}
        </p>
      ) : null}

      <div className="premium-card-perspective px-1 py-2">
        <aside
          className="premium-card-3d group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-surface/90 via-surface/70 to-background shadow-[0_28px_60px_-12px_rgba(0,0,0,0.65),0_12px_0_rgba(13,13,13,0.35),inset_0_1px_0_rgba(255,255,255,0.06)] transition-transform duration-500 ease-out [transform:perspective(900px)_rotateX(4deg)] hover:[transform:perspective(900px)_rotateX(2deg)_translateY(-4px)]"
          style={{ transformStyle: "preserve-3d" }}
        >
          <div
            className="pointer-events-none absolute -inset-px rounded-xl bg-gradient-to-br from-orange/25 via-transparent to-orange/10 opacity-80"
            aria-hidden
          />

          <div className="relative overflow-hidden border-b border-white/8">
            <div className="relative aspect-[16/9] bg-background">
              <Image
                src={course.coverImage}
                alt={course.listTitle}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                sizes="(max-width: 768px) 100vw, 720px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
            </div>
          </div>

          <div className="relative space-y-4 p-5 md:p-6">
            <div className="space-y-2 text-center">
              <h3 className="font-dm text-lg font-semibold leading-snug text-cream md:text-xl">
                {course.listTitle}
              </h3>
              <p className="font-dm text-sm text-cream/65">
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

            <div className="flex flex-col gap-2.5 sm:flex-row">
              {applyUrl ? (
                <a
                  href={applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-1 items-center justify-center rounded-sm bg-orange px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-background shadow-[0_6px_20px_rgba(255,92,0,0.35)] transition-all hover:bg-cream hover:shadow-[0_8px_24px_rgba(255,92,0,0.45)] rtl:tracking-normal"
                >
                  {labels.applyNow}
                </a>
              ) : (
                <Link
                  href={courseHref}
                  className="flex flex-1 items-center justify-center rounded-sm bg-orange px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-background shadow-[0_6px_20px_rgba(255,92,0,0.35)] transition-all hover:bg-cream hover:shadow-[0_8px_24px_rgba(255,92,0,0.45)] rtl:tracking-normal"
                >
                  {labels.applyNow}
                </Link>
              )}
              <Link
                href={courseHref}
                className="flex flex-1 items-center justify-center rounded-sm border border-orange/50 bg-background/40 px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-orange backdrop-blur-sm transition-colors hover:border-orange hover:bg-orange hover:text-background rtl:tracking-normal"
              >
                {labels.viewDetails}
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
