import { redirect } from "next/navigation";
import StudentDashboardHero from "@/components/members/StudentDashboardHero";
import StudentGlassCard from "@/components/members/StudentGlassCard";
import StudentPortalButton from "@/components/members/StudentPortalButton";
import StudentProgramCard from "@/components/members/StudentProgramCard";
import { accountLoginPath, learnProgramPath } from "@/lib/members/paths";
import {
  getStudentDashboard,
  listAnnouncementsForStudent,
} from "@/lib/members/store";
import type { UsefulLink } from "@/lib/members/types";
import { getCourses } from "@/lib/courses/store";
import StudentUpcomingCourseCard from "@/components/members/StudentUpcomingCourseCard";
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

  const upcomingCourses = courses.filter((c) => c.status !== "Closed").slice(0, 2);
  const courseStatusLabels = translations[internal].coursesPage.statusLabels;

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
        ]}
        progressPercent={overallProgress}
        progressLabel={t.memberPortal.statProgress}
      />

      <StudentGlassCard id="announcements" className="scroll-mt-36">
        <h2 className="student-section-title">{t.memberPortal.navAnnouncements}</h2>
        {announcements.length === 0 ? (
          <p className="mt-4 font-dm text-sm text-cream/55">{t.memberPortal.noAnnouncements}</p>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {announcements.map((item) => (
              <li
                key={item.id}
                className="student-glass-pill rounded-xl px-4 py-4"
              >
                <p className="font-dm text-lg font-semibold text-cream">{item.title}</p>
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

      <StudentGlassCard id="upcoming-courses" className="scroll-mt-36">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="max-w-2xl">
            <h2 className="student-section-title">{t.memberPortal.navUpcomingCourses}</h2>
            <p className="mt-2 font-dm text-sm leading-relaxed text-cream/65">
              {t.memberPortal.upcomingCoursesSubtitle}
            </p>
          </div>
          <StudentPortalButton
            href={localizedPath("/courses", locale)}
            variant="secondary"
            className="shrink-0"
          >
            {t.memberPortal.viewAllCourses}
          </StudentPortalButton>
        </div>
        {upcomingCourses.length === 0 ? (
          <p className="mt-4 font-dm text-sm text-cream/55">{t.memberPortal.noUpcomingCourses}</p>
        ) : (
          <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {upcomingCourses.map((course) => (
              <li key={course.slug} className="min-h-0">
                <StudentUpcomingCourseCard
                  href={localizedPath(`/courses/${course.slug}`, locale)}
                  title={course.listTitle}
                  excerpt={course.excerpt}
                  date={course.date}
                  statusLabel={courseStatusLabels[course.status]}
                  isLive={course.status === "Live"}
                  coverImage={course.coverImage}
                  viewLabel={t.memberPortal.viewCourse}
                />
              </li>
            ))}
          </ul>
        )}
      </StudentGlassCard>

      <StudentGlassCard id="my-programs" className="scroll-mt-36">
        <h2 className="student-section-title">{t.memberPortal.myPrograms}</h2>
        {programs.length === 0 ? (
          <p className="mt-4 font-dm text-sm text-cream/55">{t.memberPortal.noPrograms}</p>
        ) : (
          <ul className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {programs.map((item) => (
              <li key={item.program.id} className="h-full">
                <StudentProgramCard
                  href={learnProgramPath(item.program.slug, locale)}
                  title={item.program.title}
                  description={item.program.description}
                  coverImage={item.program.coverImage}
                  progressPercent={item.progressPercent}
                  completedLessons={item.completedLessons}
                  totalLessons={item.totalLessons}
                  progressLabel={t.memberPortal.progress}
                  lessonsLabel={t.memberPortal.lessons}
                  accessLabel={t.memberPortal.accessUntil}
                  accessValue={
                    item.enrollment.accessEndsAt
                      ? new Date(item.enrollment.accessEndsAt).toLocaleDateString(dateLocale)
                      : t.memberPortal.noExpiry
                  }
                  openLabel={t.memberPortal.openProgram}
                />
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
                <StudentPortalButton href={link.url} variant="secondary" external>
                  {link.label}
                </StudentPortalButton>
              </li>
            ))}
          </ul>
        </StudentGlassCard>
      )}
    </div>
  );
}
