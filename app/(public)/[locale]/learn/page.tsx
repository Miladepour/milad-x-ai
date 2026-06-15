import { redirect } from "next/navigation";
import StudentDashboardHero from "@/components/members/StudentDashboardHero";
import StudentAnnouncementsDashboard from "@/components/members/StudentAnnouncementsDashboard";
import StudentGlassCard from "@/components/members/StudentGlassCard";
import StudentPortalButton from "@/components/members/StudentPortalButton";
import { accountLoginPath, learnAnnouncementsPath } from "@/lib/members/paths";
import {
  getStudentDashboard,
  getStudentEnrollmentCount,
  getStudentExpiredPrograms,
  listAnnouncementsForStudent,
} from "@/lib/members/store";
import { collectUsefulLinks } from "@/lib/members/learn-content";
import { getCourses } from "@/lib/courses/store";
import StudentUpcomingCourseCard from "@/components/members/StudentUpcomingCourseCard";
import StudentProgramCardList from "@/components/members/StudentProgramCardList";
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

  const [programs, expiredPrograms, announcements, courses, enrollmentCount] =
    await Promise.all([
    getStudentDashboard(student.user.id),
    getStudentExpiredPrograms(student.user.id),
    listAnnouncementsForStudent(student.user.id, student.profile.locale),
    getCourses(internal),
    getStudentEnrollmentCount(student.user.id),
  ]);

  const upcomingCourses = courses.filter((c) => c.status !== "Closed").slice(0, 2);
  const courseStatusLabels = translations[internal].coursesPage.statusLabels;

  const usefulLinks = collectUsefulLinks(programs);

  const totalLessons = programs.reduce((sum, p) => sum + p.totalLessons, 0);
  const completedLessons = programs.reduce((sum, p) => sum + p.completedLessons, 0);
  const overallProgress =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const displayName =
    student.profile.fullName?.trim() || student.profile.email.split("@")[0];

  const programCardLabels = {
    progress: t.memberPortal.progress,
    lessons: t.memberPortal.lessons,
    accessUntil: t.memberPortal.accessUntil,
    noExpiry: t.memberPortal.noExpiry,
    openProgram: t.memberPortal.openProgram,
    expiredOn: t.memberPortal.expiredOn,
    programLocked: t.memberPortal.programLocked,
    certificateIncluded: t.memberPortal.certificateIncluded,
  };

  return (
    <div className="flex flex-col gap-5 pb-10 sm:gap-6">
      <StudentDashboardHero
        brandName={t.footer.brandName}
        welcomeLabel={t.memberPortal.welcome}
        displayName={displayName}
        subtitle={t.memberPortal.dashboardSubtitle}
        initials={getInitials(student.profile.fullName, student.profile.email)}
        stats={[
          { label: t.memberPortal.statPrograms, value: enrollmentCount },
          {
            label: t.memberPortal.statLessonsDone,
            value: completedLessons,
            hint: `/ ${totalLessons}`,
          },
        ]}
        progressPercent={overallProgress}
        progressLabel={t.memberPortal.statProgress}
      />

      <StudentAnnouncementsDashboard
        announcements={announcements}
        announcementsHref={learnAnnouncementsPath(locale)}
        dateLocale={dateLocale}
        labels={{
          sectionTitle: t.memberPortal.navAnnouncements,
          noAnnouncements: t.memberPortal.noAnnouncements,
          seeAll: t.memberPortal.seeAllAnnouncements,
          learnMore: t.memberPortal.learnMore,
          read: t.memberPortal.announcementRead,
          unread: t.memberPortal.announcementUnread,
        }}
      />

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
          <div className="mt-5">
            <StudentProgramCardList
              programs={programs}
              locale={locale}
              dateLocale={dateLocale}
              labels={programCardLabels}
            />
          </div>
        )}
      </StudentGlassCard>

      {expiredPrograms.length > 0 && (
        <StudentGlassCard id="expired-programs" className="scroll-mt-36">
          <h2 className="student-section-title">{t.memberPortal.expiredPrograms}</h2>
          <p className="mt-2 font-dm text-sm leading-relaxed text-cream/65">
            {t.memberPortal.expiredProgramsSubtitle}
          </p>
          <div className="mt-5">
            <StudentProgramCardList
              programs={expiredPrograms}
              locale={locale}
              dateLocale={dateLocale}
              locked
              labels={programCardLabels}
            />
          </div>
        </StudentGlassCard>
      )}

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
