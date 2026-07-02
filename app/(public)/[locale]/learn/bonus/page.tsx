import { redirect } from "next/navigation";
import StudentGlassCard from "@/components/members/StudentGlassCard";
import StudentBonusProgramCardList from "@/components/members/StudentBonusProgramCardList";
import { getStudentBonusPrograms } from "@/lib/members/bonus-store";
import { accountLoginPath } from "@/lib/members/paths";
import { urlLocaleToInternal, type UrlLocale } from "@/lib/i18n/config";
import { getStudentUser } from "@/lib/supabase/require-student";
import { translations } from "@/lib/i18n/translations";

export const dynamic = "force-dynamic";

export default async function LearnBonusProgramsPage({
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

  const bonusPrograms = await getStudentBonusPrograms(student.user.id);

  return (
    <div className="flex flex-col gap-5 pb-10 sm:gap-6">
      <StudentGlassCard>
        <h1 className="font-dm text-2xl font-semibold text-cream sm:text-3xl">
          {t.memberPortal.bonusPrograms}
        </h1>
        <p className="mt-2 font-dm text-sm text-cream/60">
          {t.memberPortal.bonusProgramsSubtitle}
        </p>
      </StudentGlassCard>

      <StudentGlassCard>
        {bonusPrograms.length === 0 ? (
          <p className="font-dm text-sm text-cream/55">{t.memberPortal.noBonusPrograms}</p>
        ) : (
          <StudentBonusProgramCardList
            programs={bonusPrograms}
            locale={locale}
            dateLocale={dateLocale}
            labels={{
              progress: t.memberPortal.progress,
              lessons: t.memberPortal.lessons,
              accessUntil: t.memberPortal.accessUntil,
              noExpiry: t.memberPortal.noExpiry,
              openProgram: t.memberPortal.openProgram,
            }}
          />
        )}
      </StudentGlassCard>
    </div>
  );
}
