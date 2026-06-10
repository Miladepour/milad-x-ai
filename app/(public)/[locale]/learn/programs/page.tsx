import { redirect } from "next/navigation";
import StudentGlassCard from "@/components/members/StudentGlassCard";
import StudentProgramCard from "@/components/members/StudentProgramCard";
import { accountLoginPath, learnProgramPath } from "@/lib/members/paths";
import { getStudentDashboard } from "@/lib/members/store";
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

  const programs = await getStudentDashboard(student.user.id);

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
          <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
    </div>
  );
}
