import { redirect } from "next/navigation";
import StudentGlassCard from "@/components/members/StudentGlassCard";
import StudentMembershipBadgeCard from "@/components/members/StudentMembershipBadgeCard";
import { accountLoginPath } from "@/lib/members/paths";
import { getStudentEnrollmentCount } from "@/lib/members/store";
import { getMembershipTierInfo } from "@/lib/members/membership-tier";
import { urlLocaleToInternal, type UrlLocale } from "@/lib/i18n/config";
import { getStudentUser } from "@/lib/supabase/require-student";
import { translations } from "@/lib/i18n/translations";

export const dynamic = "force-dynamic";

export default async function LearnClubCardPage({
  params,
}: {
  params: { locale: string };
}) {
  const locale = params.locale as UrlLocale;
  const internal = urlLocaleToInternal(locale);
  const t = translations[internal];

  const student = await getStudentUser();
  if (!student) redirect(accountLoginPath(locale));

  const enrollmentCount = await getStudentEnrollmentCount(student.user.id);
  const membership = getMembershipTierInfo(enrollmentCount);

  return (
    <div className="flex flex-col gap-5 pb-10 sm:gap-6">
      <StudentGlassCard>
        <h1 className="font-dm text-2xl font-semibold text-cream sm:text-3xl">
          {t.memberPortal.navClubCard}
        </h1>
        <p className="mt-2 font-dm text-sm text-cream/60">{t.memberPortal.clubCardPageSubtitle}</p>
      </StudentGlassCard>

      <StudentMembershipBadgeCard
        info={membership}
        tierLabels={{
          silver: t.memberPortal.membershipTierSilver,
          gold: t.memberPortal.membershipTierGold,
          platinum: t.memberPortal.membershipTierPlatinum,
        }}
        labels={{
          title: t.memberPortal.membershipBadgeTitle,
          subtitle: t.memberPortal.membershipBadgeSubtitle,
          coursesEnrolled: t.memberPortal.membershipCoursesEnrolled,
          progressTo: t.memberPortal.membershipProgressTo,
          maxTier: t.memberPortal.membershipMaxTier,
          enrollFirst: t.memberPortal.membershipEnrollFirst,
          tierRanges: t.memberPortal.membershipTierRanges,
          coursesToGo: t.memberPortal.membershipCoursesToGo,
          discountGold: t.memberPortal.membershipDiscountGold,
          discountPlatinum: t.memberPortal.membershipDiscountPlatinum,
          discountActive: t.memberPortal.membershipDiscountActive,
          discountUnlock: t.memberPortal.membershipDiscountUnlock,
        }}
      />
    </div>
  );
}
