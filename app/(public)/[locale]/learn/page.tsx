import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import StudentDashboardHero from "@/components/members/StudentDashboardHero";
import StudentGlassCard from "@/components/members/StudentGlassCard";
import StudentProgressRing from "@/components/members/StudentProgressRing";
import {
  accountLoginPath,
  learnLessonPath,
  learnProgramPath,
} from "@/lib/members/paths";
import {
  getStudentDashboard,
  listAnnouncementsForStudent,
} from "@/lib/members/store";
import type { UsefulLink } from "@/lib/members/types";
import { getCourses } from "@/lib/courses/store";
import { urlLocaleToInternal, type UrlLocale } from "@/lib/i18n/config";
import { localizedPath } from "@/lib/i18n/paths";
import { getStudentUser } from "@/lib/supabase/require-student";
import { translations } from "@/lib/i18n/translations";

export const dynamic = "force-dynamic";

function getInitials(name: string, email: string): string {
  const trimmed = name.trim();
  if (trimmed) {
    const parts = trimmed.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
    }
    return trimmed.slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

export default async function LearnDashboardPage({
  params,
}: {
  params: { locale: string };
}) {
  const locale = params.locale as UrlLocale;
  const internal = urlLocaleToInternal(locale);
  const t = translations[internal];
  const dateLocale = internal === "FA" ? "fa-IR" : "en-GB";

  const student = await getStudentUser();
  if (!student) redirect(accountLoginPath(locale));

  const [programs, announcements, courses] = await Promise.all([
    getStudentDashboard(student.user.id),
    listAnnouncementsForStudent(student.profile.locale),
    getCourses(internal),
  ]);

  const upcomingCourses = courses.filter((c) => c.status !== "Closed").slice(0, 5);

  const usefulLinks: UsefulLink[] = [];
  const seen = new Set<string>();
  for (const item of programs) {
    for (const link of item.program.usefulLinks) {
      if (!seen.has(link.url)) {
        seen.add(link.url);
        usefulLinks.push(link);
      }
    }
  }

  const continueItem = programs.find((p) => p.continueLesson);
  const totalLessons = programs.reduce((sum, p) => sum + p.totalLessons, 0);
  const completedLessons = programs.reduce((sum, p) => sum + p.completedLessons, 0);
  const overallProgress =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const displayName =
    student.profile.fullName?.trim() || student.profile.email.split("@")[0];

  return (
    <div className="flex flex-col gap-5 pb-10 sm:gap-6">
      <StudentDashboardHero
        brandName={t.footer.brandName}
        welcomeLabel={t.memberPortal.welcome}
        displayName={displayName}
        subtitle={t.memberPortal.dashboardSubtitle}
        initials={getInitials(student.profile.fullName, student.profile.email)}
        stats={[
          { label: t.memberPortal.statPrograms, value: programs.length },
          {
            label: t.memberPortal.statLessonsDone,
            value: completedLessons,
            hint: `/ ${totalLessons}`,
          },
          {
            label: t.memberPortal.statProgress,
            value: `${overallProgress}%`,
          },
        ]}
      />

      <div className="grid gap-5 lg:grid-cols-12 lg:grid-rows-[auto_auto] lg:gap-6">
        <StudentGlassCard className="flex items-center justify-center lg:col-span-3">
          <StudentProgressRing
            percent={overallProgress}
            label={t.memberPortal.statProgress}
            sublabel={t.memberPortal.dashboardTitle}
          />
        </StudentGlassCard>

        {continueItem?.continueLesson ? (
          <StudentGlassCard variant="accent" className="lg:col-span-5">
            <p className="student-section-title">{t.memberPortal.continueWatching}</p>
            <p className="mt-3 font-dm text-xl font-semibold text-cream">
              {continueItem.continueLesson.title}
            </p>
            <p className="mt-1 font-dm text-sm text-cream/60">{continueItem.program.title}</p>
            <Link
              href={learnLessonPath(
                continueItem.program.slug,
                continueItem.continueLesson.id,
                locale
              )}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-orange px-5 py-2.5 font-mono text-[10px] uppercase tracking-widest text-background transition-colors hover:bg-cream"
            >
              {t.memberPortal.continueCta} →
            </Link>
          </StudentGlassCard>
        ) : (
          <StudentGlassCard className="flex flex-col justify-center lg:col-span-5">
            <p className="student-section-title">{t.memberPortal.continueWatching}</p>
            <p className="mt-3 font-dm text-sm text-cream/60">
              {programs.length === 0
                ? t.memberPortal.noPrograms
                : t.memberPortal.dashboardSubtitle}
            </p>
          </StudentGlassCard>
        )}

        <StudentGlassCard
          id="upcoming-courses"
          className="scroll-mt-36 lg:col-span-4 lg:row-span-2"
        >
          <div className="flex items-start justify-between gap-3">
            <h2 className="student-section-title">{t.memberPortal.navUpcomingCourses}</h2>
            <Link
              href={localizedPath("/courses", locale)}
              className="font-mono text-[10px] uppercase tracking-widest text-orange hover:text-cream"
            >
              {t.memberPortal.viewAllCourses} →
            </Link>
          </div>
          {upcomingCourses.length === 0 ? (
            <p className="mt-4 font-dm text-sm text-cream/55">{t.memberPortal.noUpcomingCourses}</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {upcomingCourses.map((course) => (
                <li key={course.slug}>
                  <Link
                    href={localizedPath(`/courses/${course.slug}`, locale)}
                    className="student-glass-pill block px-4 py-3 transition-colors hover:border-orange/30 hover:bg-white/[0.06]"
                  >
                    <p className="font-mono text-[10px] text-orange">{course.date}</p>
                    <p className="mt-1 font-dm text-sm font-medium text-cream line-clamp-1">
                      {course.listTitle}
                    </p>
                    <span className="mt-2 inline-block font-mono text-[9px] uppercase tracking-widest text-cream/45">
                      {course.status}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </StudentGlassCard>

        <StudentGlassCard id="announcements" className="scroll-mt-36 lg:col-span-8">
          <h2 className="student-section-title">{t.memberPortal.navAnnouncements}</h2>
          {announcements.length === 0 ? (
            <p className="mt-4 font-dm text-sm text-cream/55">{t.memberPortal.noAnnouncements}</p>
          ) : (
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {announcements.map((item) => (
                <li
                  key={item.id}
                  className="student-glass-pill rounded-xl px-4 py-4"
                >
                  <p className="font-dm font-medium text-cream">{item.title}</p>
                  {item.body && (
                    <p className="mt-2 line-clamp-3 font-dm text-sm leading-relaxed text-cream/65">
                      {item.body}
                    </p>
                  )}
                  {item.publishedAt && (
                    <p className="mt-3 font-mono text-[10px] text-cream/40">
                      {new Date(item.publishedAt).toLocaleDateString(dateLocale, {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </StudentGlassCard>
      </div>

      <StudentGlassCard id="my-programs" className="scroll-mt-36">
        <h2 className="student-section-title">{t.memberPortal.myPrograms}</h2>
        {programs.length === 0 ? (
          <p className="mt-4 font-dm text-sm text-cream/55">{t.memberPortal.noPrograms}</p>
        ) : (
          <ul className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {programs.map((item) => (
              <li
                key={item.program.id}
                className="student-glass-strong overflow-hidden rounded-2xl"
              >
                {item.program.coverImage && (
                  <div className="relative aspect-[16/10] bg-surface">
                    <Image
                      src={item.program.coverImage}
                      alt=""
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                    <div className="absolute bottom-3 start-3 end-3">
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-orange"
                          style={{ width: `${item.progressPercent}%` }}
                        />
                      </div>
                      <p className="mt-1 font-mono text-[9px] uppercase tracking-widest text-cream/70">
                        {item.progressPercent}% {t.memberPortal.progress}
                      </p>
                    </div>
                  </div>
                )}
                <div className="p-5">
                  <h3 className="font-dm text-lg font-semibold text-cream">{item.program.title}</h3>
                  <p className="mt-2 line-clamp-2 font-dm text-sm text-cream/60">
                    {item.program.description}
                  </p>
                  {!item.program.coverImage && (
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-orange"
                        style={{ width: `${item.progressPercent}%` }}
                      />
                    </div>
                  )}
                  <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-cream/45">
                    {item.completedLessons}/{item.totalLessons} {t.memberPortal.lessons} ·{" "}
                    {t.memberPortal.accessUntil}:{" "}
                    {item.enrollment.accessEndsAt
                      ? new Date(item.enrollment.accessEndsAt).toLocaleDateString(dateLocale)
                      : t.memberPortal.noExpiry}
                  </p>
                  <Link
                    href={learnProgramPath(item.program.slug, locale)}
                    className="mt-4 inline-flex rounded-full border border-orange/50 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-orange transition-colors hover:bg-orange hover:text-background"
                  >
                    {t.memberPortal.viewProgram}
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </StudentGlassCard>

      {usefulLinks.length > 0 && (
        <StudentGlassCard id="resources" className="scroll-mt-36">
          <h2 className="student-section-title">{t.memberPortal.usefulLinks}</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {usefulLinks.map((link) => (
              <li key={link.url}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="student-glass-pill flex items-center gap-3 px-4 py-3 font-dm text-sm text-cream transition-colors hover:border-orange/30 hover:text-orange"
                >
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange/15 font-mono text-orange"
                    aria-hidden
                  >
                    ↗
                  </span>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </StudentGlassCard>
      )}
    </div>
  );
}
