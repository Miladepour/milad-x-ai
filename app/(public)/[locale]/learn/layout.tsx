import type { Metadata } from "next";
import { redirect } from "next/navigation";
import StudentDashboardShell from "@/components/members/StudentDashboardShell";
import StudentDeviceBlocked from "@/components/members/StudentDeviceBlocked";
import StudentDeviceRegistrar from "@/components/members/StudentDeviceRegistrar";
import { resolveLessonTitle } from "@/lib/members/lesson-localized";
import { resolveProgramTitle } from "@/lib/members/program-localized";
import { accountLoginPath, learnLessonPath } from "@/lib/members/paths";
import {
  getStudentDashboard,
  getStudentEnrollmentCount,
  listAnnouncementsForStudent,
  syncExpiredEnrollments,
} from "@/lib/members/store";
import { pickContinueWatchingProgram } from "@/lib/members/continue-watching";
import { getMembershipTierInfo } from "@/lib/members/membership-tier";
import { isValidLocale, urlLocaleToInternal, type UrlLocale } from "@/lib/i18n/config";
import { getStudentUser } from "@/lib/supabase/require-student";
import { translations } from "@/lib/i18n/translations";
import {
  getStudentDeviceCapMax,
  isStudentDeviceCapEnforced,
} from "@/lib/members/device";
import {
  deviceBootstrapUrl,
  verifyStudentDeviceAccess,
} from "@/lib/members/device-session";

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

  try {
    const deviceAccess = await verifyStudentDeviceAccess(student.user.id);

    if (deviceAccess.needsBootstrap && isStudentDeviceCapEnforced()) {
      redirect(deviceBootstrapUrl(locale));
    }

    if (!deviceAccess.allowed) {
      return (
        <div className="pt-20">
          <StudentDeviceBlocked
            locale={locale}
            cap={deviceAccess.cap}
            labels={{
              title: t.memberPortal.deviceBlockedTitle,
              body: t.memberPortal.deviceBlockedBody,
              contactSupport: t.memberPortal.contactSupport,
              tryAgain: t.memberPortal.deviceBlockedRetry,
              signOut: t.memberPortal.signOut,
            }}
          />
        </div>
      );
    }
  } catch (error) {
    console.error("[learn/layout] device check failed:", error);
    if (isStudentDeviceCapEnforced()) {
      return (
        <div className="pt-20">
          <StudentDeviceBlocked
            locale={locale}
            cap={getStudentDeviceCapMax()}
            labels={{
              title: t.memberPortal.deviceBlockedTitle,
              body: t.memberPortal.deviceBlockedBody,
              contactSupport: t.memberPortal.contactSupport,
              tryAgain: t.memberPortal.deviceBlockedRetry,
              signOut: t.memberPortal.signOut,
            }}
          />
        </div>
      );
    }
  }

  await syncExpiredEnrollments();

  const [programs, announcements, enrollmentCount] = await Promise.all([
    getStudentDashboard(student.user.id),
    listAnnouncementsForStudent(student.user.id, student.profile.locale),
    getStudentEnrollmentCount(student.user.id),
  ]);
  const continueItem = pickContinueWatchingProgram(programs);
  const announcementUnreadCount = announcements.filter((item) => !item.isRead).length;
  const membership = getMembershipTierInfo(enrollmentCount);

  const displayName =
    student.profile.fullName?.trim() || student.profile.email.split("@")[0];

  return (
    <div className="pt-20">
      <StudentDeviceRegistrar />
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
                lessonTitle: resolveLessonTitle(
                  continueItem.continueLesson,
                  internal
                ),
                programTitle: resolveProgramTitle(continueItem.program, internal),
                label: t.memberPortal.continueWatching,
                cta: t.memberPortal.continueCta,
              }
            : null
        }
        labels={{
          overview: t.memberPortal.navOverview,
          myPrograms: t.memberPortal.myPrograms,
          bonusPrograms: t.memberPortal.bonusPrograms,
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
          studentMenu: t.memberPortal.studentMenu,
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
