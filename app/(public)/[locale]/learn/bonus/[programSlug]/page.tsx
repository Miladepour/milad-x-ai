import { notFound } from "next/navigation";
import StudentGlassCard from "@/components/members/StudentGlassCard";
import StudentLessonCard from "@/components/members/StudentLessonCard";
import StudentPortalButton from "@/components/members/StudentPortalButton";
import { resolveLessonBody, resolveLessonTitle } from "@/lib/members/lesson-localized";
import {
  resolveProgramDescription,
  resolveProgramTitle,
} from "@/lib/members/program-localized";
import { getStudentBonusProgram } from "@/lib/members/bonus-store";
import { getCompletedLessonIds } from "@/lib/members/store";
import { learnBonusLessonPath, learnPath } from "@/lib/members/paths";
import type { LessonType } from "@/lib/members/types";
import { urlLocaleToInternal, type UrlLocale } from "@/lib/i18n/config";
import { getStudentUser } from "@/lib/supabase/require-student";
import { translations } from "@/lib/i18n/translations";

export const dynamic = "force-dynamic";

export default async function LearnBonusProgramPage({
  params,
}: {
  params: { locale: string; programSlug: string };
}) {
  const locale = params.locale as UrlLocale;
  const internal = urlLocaleToInternal(locale);
  const t = translations[internal];

  const student = await getStudentUser();
  if (!student) notFound();

  const data = await getStudentBonusProgram(student.user.id, params.programSlug);
  if (!data) notFound();

  const completedIds = await getCompletedLessonIds(
    student.user.id,
    data.lessons.map((lesson) => lesson.id)
  );

  const typeLabels: Record<LessonType, string> = {
    video: t.memberPortal.lessonTypeVideo,
    text: t.memberPortal.lessonTypeText,
    quiz: t.memberPortal.lessonTypeQuiz,
  };

  const programTitle = resolveProgramTitle(data.program, internal);
  const programDescription = resolveProgramDescription(data.program, internal);
  const sortedLessons = [...data.lessons].sort((a, b) => a.sortOrder - b.sortOrder);
  const dateLocale = internal === "FA" ? "fa-IR" : "en-GB";

  return (
    <div className="flex flex-col gap-5 pb-10 sm:gap-6">
      <StudentGlassCard>
        <StudentPortalButton href={learnPath(locale)} variant="secondary">
          {t.memberPortal.backToDashboard}
        </StudentPortalButton>
        <p className="mt-5 student-section-title">{t.memberPortal.bonusPrograms}</p>
        <h1 className="mt-2 font-dm text-2xl font-semibold text-orange sm:text-3xl">
          {programTitle}
        </h1>
        <p className="mt-3 font-dm text-cream/70">{programDescription}</p>
        <p className="mt-4 font-dm text-sm text-cream/60">{t.memberPortal.bonusProgramsHint}</p>
        <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-cream/50">
          {t.memberPortal.accessUntil}:{" "}
          {data.accessEndsAt
            ? new Date(data.accessEndsAt).toLocaleDateString(dateLocale)
            : t.memberPortal.noExpiry}
        </p>
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
          {sortedLessons.map((lesson, index) => {
            const completed = completedIds.has(lesson.id);

            return (
              <li key={lesson.id}>
                <StudentLessonCard
                  href={learnBonusLessonPath(data.program.slug, lesson.id, locale)}
                  index={index}
                  title={resolveLessonTitle(lesson, internal)}
                  description={resolveLessonBody(lesson, internal)}
                  durationMinutes={lesson.durationMinutes}
                  openLabel={t.memberPortal.openLesson}
                  locked={false}
                  completed={completed}
                  completedLabel={t.memberPortal.completed}
                  lessonType={lesson.lessonType}
                  typeLabels={typeLabels}
                />
              </li>
            );
          })}
        </ul>
      </StudentGlassCard>
    </div>
  );
}
