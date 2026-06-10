import { notFound } from "next/navigation";
import StudentGlassCard from "@/components/members/StudentGlassCard";
import StudentLessonCard from "@/components/members/StudentLessonCard";
import StudentPortalButton from "@/components/members/StudentPortalButton";
import { learnLessonPath, learnPath } from "@/lib/members/paths";
import { getStudentProgram } from "@/lib/members/store";
import { urlLocaleToInternal, type UrlLocale } from "@/lib/i18n/config";
import { getStudentUser } from "@/lib/supabase/require-student";
import { translations } from "@/lib/i18n/translations";

export const dynamic = "force-dynamic";

export default async function LearnProgramPage({
  params,
}: {
  params: { locale: string; programSlug: string };
}) {
  const locale = params.locale as UrlLocale;
  const internal = urlLocaleToInternal(locale);
  const t = translations[internal];

  const student = await getStudentUser();
  if (!student) notFound();

  const data = await getStudentProgram(student.user.id, params.programSlug);
  if (!data) notFound();

  return (
    <div className="flex flex-col gap-5 pb-10 sm:gap-6">
      <StudentGlassCard>
        <StudentPortalButton href={learnPath(locale)} variant="secondary">
          {t.memberPortal.backToDashboard}
        </StudentPortalButton>
        <h1 className="mt-5 font-dm text-2xl font-semibold text-orange sm:text-3xl">
          {data.program.title}
        </h1>
        <p className="mt-3 font-dm text-cream/70">{data.program.description}</p>
        <div className="mt-5 flex items-center gap-3">
          <div className="h-2 max-w-xs flex-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-orange"
              style={{ width: `${data.progressPercent}%` }}
            />
          </div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-cream/50">
            {t.memberPortal.progress}: {data.progressPercent}% ({data.completedLessons}/
            {data.totalLessons})
          </p>
        </div>
      </StudentGlassCard>

      {data.program.usefulLinks.length > 0 && (
        <StudentGlassCard>
          <h2 className="student-section-title">{t.memberPortal.usefulLinks}</h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {data.program.usefulLinks.map((link) => (
              <li key={link.url}>
                <StudentPortalButton href={link.url} variant="secondary" external>
                  {link.label}
                </StudentPortalButton>
              </li>
            ))}
          </ul>
        </StudentGlassCard>
      )}

      <StudentGlassCard>
        <h2 className="student-section-title">{t.memberPortal.lessonList}</h2>
        <ul className="mt-3 space-y-2">
          {data.lessons.map((lesson, index) => (
            <li key={lesson.id}>
              <StudentLessonCard
                href={learnLessonPath(data.program.slug, lesson.id, locale)}
                index={index}
                title={lesson.title}
                description={lesson.description}
                openLabel={t.memberPortal.openLesson}
              />
            </li>
          ))}
        </ul>
      </StudentGlassCard>
    </div>
  );
}
