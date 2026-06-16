import Link from "next/link";
import type { Course } from "@/lib/courses/types";
import type { Locale } from "@/lib/i18n/translations";
import { toLocaleDigits } from "@/lib/i18n/digits";

const statusClass = {
  Live: "bg-orange text-background border-orange",
  "Coming Soon": "bg-transparent text-orange border-orange",
  Closed: "bg-transparent text-muted border-muted",
} as const;

interface CourseDetailHeroProps {
  course: Course;
  lang: Locale;
  statusLabel: string;
  nav: { home: string; courses: string };
  homeHref: string;
  coursesHref: string;
  detail: {
    createdBy: string;
    workshopDate: string;
    session1: string;
    session2: string;
    sessionHours: string;
    format: string;
    language: string;
    languageEn: string;
    languageFa: string;
  };
}

function sessionLabel(index: number, detail: CourseDetailHeroProps["detail"]) {
  return index === 0 ? detail.session1 : detail.session2;
}

function formatSessionHours(template: string, hours: number, lang: Locale) {
  return template.replace("{hours}", toLocaleDigits(String(hours), lang));
}

export default function CourseDetailHero({
  course,
  lang,
  statusLabel,
  nav,
  homeHref,
  coursesHref,
  detail,
}: CourseDetailHeroProps) {
  const tutorNames = [
    ...(course.meta.tutors?.map((t) => t.name[lang]) ?? []),
    course.meta.instructor,
  ];

  return (
    <header
      className="border-b border-surface"
      style={{
        background:
          "linear-gradient(180deg, rgba(255,92,0,0.08) 0%, transparent 55%), #0D0D0D",
      }}
    >
      <div className="max-w-7xl mx-auto px-8 md:px-12 lg:px-16 pt-28 pb-8 md:pb-10">
        <nav className="flex flex-wrap items-center gap-2 text-sm font-dm text-muted mb-6">
          <Link href={homeHref} className="hover:text-cream transition-colors">
            {nav.home}
          </Link>
          <span aria-hidden>/</span>
          <Link href={coursesHref} className="hover:text-cream transition-colors">
            {nav.courses}
          </Link>
          <span aria-hidden>/</span>
          <span className="text-cream/70 line-clamp-1">{course.listTitle}</span>
        </nav>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span
            className={`type-badge font-mono border px-2 py-1 ${statusClass[course.status]}`}
            style={{ borderRadius: "2px" }}
          >
            {statusLabel}
          </span>
          <span className="type-badge font-mono border border-orange/50 text-orange px-2 py-1 bg-orange/10">
            {course.meta.format}
          </span>
        </div>

        <p className="font-mono text-orange text-sm mb-2">{course.title}</p>
        <h1 className="type-course-page-title font-dm font-bold text-cream mb-3 max-w-4xl">
          {course.listTitle}
        </h1>
        <p className="type-course-subtitle font-dm text-cream/90 mb-6 max-w-3xl">
          {course.subtitle}
        </p>

        <ul className="flex flex-wrap gap-x-6 gap-y-2 font-dm text-sm text-cream/80">
          <li>
            {detail.createdBy}{" "}
            <span className="text-cream font-medium">{tutorNames.join(", ")}</span>
          </li>
          <li>
            {detail.workshopDate}:{" "}
            <span className="text-cream">{toLocaleDigits(course.date, lang)}</span>
          </li>
          {course.meta.sessions.map((session, index) => (
            <li key={session.id}>
              {sessionLabel(index, detail)}:{" "}
              <span className="text-cream">
                {toLocaleDigits(session.date, lang)}, {toLocaleDigits(session.time, lang)}{" "}
                <span className="text-cream/70">({course.meta.timezone})</span>
                {" · "}
                {formatSessionHours(detail.sessionHours, session.durationHours, lang)}
              </span>
            </li>
          ))}
          <li>
            {detail.format}: <span className="text-cream">{course.meta.format}</span>
          </li>
          <li>
            {detail.language}:{" "}
            <span className="text-cream">
              {lang === "FA" ? detail.languageFa : detail.languageEn}
            </span>
          </li>
        </ul>
      </div>
    </header>
  );
}
