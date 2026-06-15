import type { Metadata } from "next";
import { redirect } from "next/navigation";
import StudentDashboardShell from "@/components/members/StudentDashboardShell";
import { accountLoginPath, learnLessonPath } from "@/lib/members/paths";
import {
  getStudentDashboard,
  getStudentEnrollmentCount,
  listAnnouncementsForStudent,
  syncExpiredEnrollments,
} from "@/lib/members/store";
import { getMembershipTierInfo } from "@/lib/members/membership-tier";
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

  const [programs, announcements, enrollmentCount] = await Promise.all([
    getStudentDashboard(student.user.id),
    listAnnouncementsForStudent(student.user.id, student.profile.locale),
    getStudentEnrollmentCount(student.user.id),
  ]);
  const continueItem = programs.find((p) => p.continueLesson);
  const announcementUnreadCount = announcements.filter((item) => !item.isRead).length;
  const membership = getMembershipTierInfo(enrollmentCount);

  const displayName =
    student.profile.fullName?.trim() || student.profile.email.split("@")[0];

  return (
    <div className="pt-20">
      <StudentDashboardShell
        locale={locale}
        studentName={displayName}
        studentEmail={student.profile.email}
        studentNumber={student.profile.studentNumber}
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
          certificates: t.memberPortal.navCertificates,
          announcements: t.memberPortal.navAnnouncements,
          upcomingCourses: t.memberPortal.navUpcomingCourses,
          resources: t.memberPortal.navResources,
          profile: t.memberPortal.navProfile,
          clubCard: t.memberPortal.navClubCard,
          support: t.memberPortal.navSupport,
          viewProfile: t.memberPortal.profileViewProfile,
          studentId: t.memberPortal.studentIdLabel,
          backToSite: t.memberPortal.backToSite,
          signOut: t.memberPortal.signOut,
          menu: t.memberPortal.menu,
          closeMenu: t.memberPortal.closeMenu,
          portalTitle: t.memberPortal.dashboardTitle,
        }}
        membership={membership}
        membershipLabels={{
          member: t.memberPortal.membershipNavLabel,
          courses: t.memberPortal.membershipCoursesShort,
          next: t.memberPortal.membershipNextShort,
          maxTier: t.memberPortal.membershipMaxTier,
          discountGold: t.memberPortal.membershipDiscountGold,
          discountPlatinum: t.memberPortal.membershipDiscountPlatinum,
          discountActive: t.memberPortal.membershipDiscountActive,
          discountPerksShort: t.memberPortal.membershipDiscountPerksShort,
          tierLabels: {
            silver: t.memberPortal.membershipTierSilver,
            gold: t.memberPortal.membershipTierGold,
            platinum: t.memberPortal.membershipTierPlatinum,
          },
        }}
      >
        {children}
      </StudentDashboardShell>
    </div>
  );
}
