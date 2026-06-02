import Image from "next/image";
import Link from "next/link";
import type { Course } from "@/lib/courses/types";
import {
  formatCoursePrice,
  formatCoursePriceTomanAmount,
  IRAN_TOMAN_PRICE_NOTE_FA,
} from "@/lib/courses";
import type { Locale } from "@/lib/i18n/translations";
import { toLocaleDigits } from "@/lib/i18n/digits";

const btnPrimary =
  "flex w-full items-center justify-center font-mono px-6 py-4 text-sm bg-orange text-background border-2 border-orange hover:bg-orange-dim hover:border-orange-dim transition-colors duration-200 rounded-sm normal-case tracking-normal";

interface CoursePurchaseSidebarProps {
  course: Course;
  lang: Locale;
  ctaHref: string;
  ctaExternal?: boolean;
  coursesIndexHref: string;
  labels: {
    primaryCta: string;
    dateLabel: string;
    session1: string;
    session2: string;
    sessionHours: string;
    priceLabel: string;
    sidebarHighlights: string;
    allCourses: string;
    insights: {
      audienceTitle: string;
      topicsTitle: string;
      requirementsTitle: string;
    };
  };
}

export default function CoursePurchaseSidebar({
  course,
  lang,
  ctaHref,
  ctaExternal = false,
  coursesIndexHref,
  labels,
}: CoursePurchaseSidebarProps) {
  const topicsCount = toLocaleDigits(course.insights.topicsCount, lang);

  return (
    <aside className="lg:sticky lg:top-28 h-fit">
      <div className="border border-surface bg-surface/50 rounded-sm overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.45)]">
        <div className="relative aspect-video bg-background overflow-hidden">
          <Image
            src={course.coverImage}
            alt={course.listTitle}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 360px"
            priority
          />
        </div>

        <div className="p-5 md:p-6 border-t border-surface space-y-5">
          <div>
            <div className="space-y-1">
              <p className="font-dm text-3xl font-bold text-cream leading-none">
                {formatCoursePrice(course.priceUsd, lang)}
              </p>
              {lang === "FA" &&
                course.priceToman != null &&
                course.priceToman > 0 && (
                  <div className="space-y-1 pt-1">
                    <p className="font-dm text-xs text-cream/65 leading-relaxed">
                      {IRAN_TOMAN_PRICE_NOTE_FA}
                    </p>
                    <p className="font-dm text-xl font-semibold text-orange leading-tight">
                      {formatCoursePriceTomanAmount(course.priceToman, lang)}
                    </p>
                  </div>
                )}
            </div>
            <p className="font-dm text-sm text-cream/70 mt-2">
              {labels.dateLabel}: {toLocaleDigits(course.date, lang)}
            </p>
            {course.meta.sessions.length > 0 && (
              <ul className="mt-3 space-y-1.5 font-dm text-sm text-cream/80">
                {course.meta.sessions.map((session, index) => (
                  <li key={session.id}>
                    <span className="text-orange">
                      {index === 0 ? labels.session1 : labels.session2}:
                    </span>{" "}
                    {toLocaleDigits(session.date, lang)}, {toLocaleDigits(session.time, lang)}{" "}
                    <span className="text-cream/60">({course.meta.timezone})</span>
                    {" · "}
                    {labels.sessionHours.replace(
                      "{hours}",
                      toLocaleDigits(String(session.durationHours), lang)
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {ctaExternal ? (
            <a
              href={ctaHref}
              target="_blank"
              rel="noopener noreferrer"
              className={btnPrimary}
            >
              {labels.primaryCta}
            </a>
          ) : (
            <Link href={ctaHref} className={btnPrimary}>
              {labels.primaryCta}
            </Link>
          )}

          <div className="border-t border-surface pt-4">
            <p className="font-mono text-xs text-orange uppercase tracking-widest rtl:tracking-normal mb-3">
              {labels.sidebarHighlights}
            </p>
            <ul className="space-y-2.5">
              <li className="flex gap-2 type-card-body font-dm text-cream">
                <span className="text-orange">◆</span>
                <span>
                  <strong className="text-orange">{topicsCount}</strong>{" "}
                  {labels.insights.topicsTitle.toLowerCase()}
                </span>
              </li>
              <li className="flex gap-2 type-card-body font-dm text-cream">
                <span className="text-orange">◆</span>
                <span>{toLocaleDigits(course.meta.totalHours, lang)} live</span>
              </li>
              {course.insights.audience.slice(0, 2).map((item) => (
                <li key={item} className="flex gap-2 type-card-body font-dm text-cream">
                  <span className="text-orange shrink-0">◆</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <Link
            href={coursesIndexHref}
            className="block text-center font-dm text-sm text-muted hover:text-cream transition-colors"
          >
            {labels.allCourses}
          </Link>
        </div>
      </div>
    </aside>
  );
}
