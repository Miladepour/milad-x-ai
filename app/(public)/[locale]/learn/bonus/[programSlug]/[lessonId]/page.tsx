import { notFound } from "next/navigation";
import LessonContent from "@/components/members/LessonContent";
import LessonMarkComplete from "@/components/members/LessonMarkComplete";
import LessonPlayer from "@/components/members/LessonPlayer";
import LessonQuizPlayer from "@/components/members/LessonQuizPlayer";
import StudentGlassCard from "@/components/members/StudentGlassCard";
import StudentPortalButton from "@/components/members/StudentPortalButton";
import { getStudentBonusLesson } from "@/lib/members/bonus-store";
import { resolveLessonBody, resolveLessonTitle } from "@/lib/members/lesson-localized";
import { resolveProgramTitle } from "@/lib/members/program-localized";
import { getQuizForStudent } from "@/lib/members/quiz-store";
import { sanitizeLessonHtml } from "@/lib/members/sanitize-lesson-html";
import { learnBonusLessonPath, learnBonusProgramPath } from "@/lib/members/paths";
import { urlLocaleToInternal, type UrlLocale } from "@/lib/i18n/config";
import { getStudentUser } from "@/lib/supabase/require-student";
import { translations } from "@/lib/i18n/translations";

export const dynamic = "force-dynamic";

export default async function LearnBonusLessonPage({
  params,
}: {
  params: { locale: string; programSlug: string; lessonId: string };
}) {
  const locale = params.locale as UrlLocale;
  const internal = urlLocaleToInternal(locale);
  const t = translations[internal];

  const student = await getStudentUser();
  if (!student) notFound();

  const data = await getStudentBonusLesson(
    student.user.id,
    params.programSlug,
    params.lessonId
  );
  if (!data) notFound();

  const sortedLessons = [...data.lessons].sort((a, b) => a.sortOrder - b.sortOrder);
  const lessonIndex = sortedLessons.findIndex((lesson) => lesson.id === data.lesson.id);
  const next =
    lessonIndex >= 0 && lessonIndex < sortedLessons.length - 1
      ? sortedLessons[lessonIndex + 1]
      : null;

  const programTitle = resolveProgramTitle(data.program, internal);
  const title = resolveLessonTitle(data.lesson, internal);
  const body = resolveLessonBody(data.lesson, internal);
  const isCompleted = !!data.progress?.completedAt;
  const lessonType = data.lesson.lessonType;

  const quizLabels = {
    submit: t.memberPortal.quizSubmit,
    submitting: t.memberPortal.quizSubmitting,
    retake: t.memberPortal.quizRetake,
    score: t.memberPortal.quizScore,
    passed: t.memberPortal.quizPassed,
    failed: t.memberPortal.quizFailed,
    yourAnswer: t.memberPortal.quizYourAnswer,
    correctAnswer: t.memberPortal.quizCorrectAnswer,
    selectAnswer: t.memberPortal.quizSelectAnswer,
    lockedNext: t.memberPortal.quizLockedNext,
  };

  const quizQuestions =
    lessonType === "quiz" ? await getQuizForStudent(data.lesson.id, internal) : [];

  const quizIntroHtml =
    lessonType === "quiz" && body.trim() ? sanitizeLessonHtml(body) : "";

  const nextHref = next
    ? learnBonusLessonPath(params.programSlug, next.id, locale)
    : null;

  return (
    <div className="flex flex-col gap-5 pb-10 sm:gap-6">
      <StudentGlassCard>
        <StudentPortalButton
          href={learnBonusProgramPath(params.programSlug, locale)}
          variant="secondary"
        >
          {programTitle}
        </StudentPortalButton>
        <p className="mt-5 student-section-title">{t.memberPortal.bonusPrograms}</p>
        <h1 className="mt-2 font-dm text-4xl font-semibold text-cream sm:text-5xl">
          {title}
        </h1>
      </StudentGlassCard>

      {lessonType === "video" && (
        <StudentGlassCard className="!p-0 overflow-hidden">
          <LessonPlayer
            lessonId={data.lesson.id}
            programSlug={params.programSlug}
            programKind="bonus"
            videoUrl={data.lesson.videoUrl}
            lessonTitle={title}
            initialPosition={data.progress?.lastPositionSeconds ?? 0}
            completed={isCompleted}
            nextHref={nextHref}
            certificateEnabled={false}
          />
          {body.trim() ? (
            <div className="border-t border-white/[0.08] px-4 py-5 sm:px-6">
              <LessonContent content={body} />
            </div>
          ) : null}
        </StudentGlassCard>
      )}

      {lessonType === "text" && (
        <StudentGlassCard className="!p-0 overflow-hidden">
          <div className="px-4 py-5 sm:px-6">
            <LessonContent content={body} />
          </div>
          <LessonMarkComplete
            lessonId={data.lesson.id}
            completed={isCompleted}
            nextHref={nextHref}
            certificateEnabled={false}
          />
        </StudentGlassCard>
      )}

      {lessonType === "quiz" && (
        <StudentGlassCard className="!p-0 overflow-hidden">
          <LessonQuizPlayer
            programSlug={params.programSlug}
            lessonId={data.lesson.id}
            introHtml={quizIntroHtml}
            questions={quizQuestions}
            certificateEnabled={false}
            labels={quizLabels}
            skipGating
          />
        </StudentGlassCard>
      )}
    </div>
  );
}
