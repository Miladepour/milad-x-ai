import { redirect } from "next/navigation";
import StudentGlassCard from "@/components/members/StudentGlassCard";
import StudentProgramCardList from "@/components/members/StudentProgramCardList";
import { accountLoginPath } from "@/lib/members/paths";
import { getStudentDashboard, getStudentExpiredPrograms } from "@/lib/members/store";
import { urlLocaleToInternal, type UrlLocale } from "@/lib/i18n/config";
import { getStudentUser } from "@/lib/supabase/require-student";
import { translations } from "@/lib/i18n/translations";

export const dynamic = "force-dynamic";

export default async function LearnProgramsPage({
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

  const [programs, expiredPrograms] = await Promise.all([
    getStudentDashboard(student.user.id),
    getStudentExpiredPrograms(student.user.id),
  ]);

  const programCardLabels = {
    progress: t.memberPortal.progress,
    lessons: t.memberPortal.lessons,
    accessUntil: t.memberPortal.accessUntil,
    noExpiry: t.memberPortal.noExpiry,
    openProgram: t.memberPortal.openProgram,
    expiredOn: t.memberPortal.expiredOn,
    programLocked: t.memberPortal.programLocked,
    certificateIncluded: t.memberPortal.certificateIncluded,
    certificatePending: t.memberPortal.certificatePendingStatus,
    certificateIssued: t.memberPortal.certificateIssuedStatus,
  };

  return (
    <div className="flex flex-col gap-5 pb-10 sm:gap-6">
      <StudentGlassCard>
        <h1 className="font-dm text-2xl font-semibold text-cream sm:text-3xl">
          {t.memberPortal.myPrograms}
        </h1>
        <p className="mt-2 font-dm text-sm text-cream/60">{t.memberPortal.programsPageSubtitle}</p>
      </StudentGlassCard>

      <StudentGlassCard>
        {programs.length === 0 ? (
          <p className="font-dm text-sm text-cream/55">{t.memberPortal.noPrograms}</p>
        ) : (
          <StudentProgramCardList
            programs={programs}
            locale={locale}
            dateLocale={dateLocale}
            labels={programCardLabels}
          />
        )}
      </StudentGlassCard>

      {expiredPrograms.length > 0 && (
        <StudentGlassCard>
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
    </div>
  );
}
