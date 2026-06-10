import type { Metadata } from "next";
import { redirect } from "next/navigation";
import StudentDashboardShell from "@/components/members/StudentDashboardShell";
import { accountLoginPath, learnLessonPath } from "@/lib/members/paths";
import {
  getStudentDashboard,
  listAnnouncementsForStudent,
  syncExpiredEnrollments,
} from "@/lib/members/store";
import { isValidLocale, urlLocaleToInternal, type UrlLocale } from "@/lib/i18n/config";
import { getStudentUser } from "@/lib/supabase/require-student";
import { translations } from "@/lib/i18n/translations";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function LearnLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!isValidLocale(params.locale)) {
    redirect("/");
  }

  const locale = params.locale as UrlLocale;
  const internal = urlLocaleToInternal(locale);
  const t = translations[internal];

  const student = await getStudentUser();

  if (!student) {
    redirect(accountLoginPath(locale));
  }

  await syncExpiredEnrollments();

  const [programs, announcements] = await Promise.all([
    getStudentDashboard(student.user.id),
    listAnnouncementsForStudent(student.user.id, student.profile.locale),
  ]);
  const continueItem = programs.find((p) => p.continueLesson);
  const announcementUnreadCount = announcements.filter((item) => !item.isRead).length;

  const displayName =
    student.profile.fullName?.trim() || student.profile.email.split("@")[0];

  return (
    <div className="pt-20">
      <StudentDashboardShell
        locale={locale}
        studentName={displayName}
        announcementUnreadCount={announcementUnreadCount}
        continueWatching={
          continueItem?.continueLesson
            ? {
                href: learnLessonPath(
                  continueItem.program.slug,
                  continueItem.continueLesson.id,
                  locale
                ),
                lessonTitle: continueItem.continueLesson.title,
                programTitle: continueItem.program.title,
                label: t.memberPortal.continueWatching,
                cta: t.memberPortal.continueCta,
              }
            : null
        }
        labels={{
          overview: t.memberPortal.navOverview,
          myPrograms: t.memberPortal.myPrograms,
          announcements: t.memberPortal.navAnnouncements,
          upcomingCourses: t.memberPortal.navUpcomingCourses,
          resources: t.memberPortal.navResources,
          backToSite: t.memberPortal.backToSite,
          signOut: t.memberPortal.signOut,
          menu: t.memberPortal.menu,
          closeMenu: t.memberPortal.closeMenu,
          portalTitle: t.memberPortal.dashboardTitle,
        }}
      >
        {children}
      </StudentDashboardShell>
    </div>
  );
}
