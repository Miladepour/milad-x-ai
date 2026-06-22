import { notFound } from "next/navigation";
import StudentAccessEnded from "@/components/members/StudentAccessEnded";
import LessonContent from "@/components/members/LessonContent";
import LessonLocked from "@/components/members/LessonLocked";
import ProgramContentLocked from "@/components/members/ProgramContentLocked";
import LessonMarkComplete from "@/components/members/LessonMarkComplete";
import LessonPlayer from "@/components/members/LessonPlayer";
import LessonQuizPlayer from "@/components/members/LessonQuizPlayer";
import StudentGlassCard from "@/components/members/StudentGlassCard";
import StudentPortalButton from "@/components/members/StudentPortalButton";
import { isEnrollmentActive } from "@/lib/members/access";
import { isLessonUnlocked } from "@/lib/members/lesson-gating";
import { resolveLessonBody, resolveLessonTitle } from "@/lib/members/lesson-localized";
import {
  resolveProgramTitle,
} from "@/lib/members/program-localized";
import { learnLessonPath, learnProgramPath, learnCertificatesPath, learnProgramCertificatePath } from "@/lib/members/paths";
import { getQuizForStudent } from "@/lib/members/quiz-store";
import { sanitizeLessonHtml } from "@/lib/members/sanitize-lesson-html";
import {
  getCompletedLessonIds,
  getStudentEnrollmentForProgram,
  getStudentLesson,
  touchLessonActivity,
} from "@/lib/members/store";
import { urlLocaleToInternal, type UrlLocale } from "@/lib/i18n/config";
import { getStudentUser } from "@/lib/supabase/require-student";
import { translations } from "@/lib/i18n/translations";

export const dynamic = "force-dynamic";

export default async function LearnLessonPage({
  params,
}: {
  params: { locale: string; programSlug: string; lessonId: string };
}) {
  const locale = params.locale as UrlLocale;
  const internal = urlLocaleToInternal(locale);
  const t = translations[internal];

  const student = await getStudentUser();
  if (!student) notFound();

  const data = await getStudentLesson(
    student.user.id,
    params.programSlug,
    params.lessonId
  );
  if (!data) {
    const enrollmentView = await getStudentEnrollmentForProgram(
      student.user.id,
      params.programSlug
    );
    if (enrollmentView && !isEnrollmentActive(enrollmentView.enrollment)) {
      return (
        <StudentAccessEnded
          locale={locale}
          programTitle={resolveProgramTitle(enrollmentView.program, internal)}
          labels={{
            title: t.memberPortal.accessEndedTitle,
            body: t.memberPortal.accessEndedBody,
            contactSupport: t.memberPortal.contactSupport,
            backToDashboard: t.memberPortal.backToDashboard,
          }}
        />
      );
    }
    notFound();
  }

  const completedIds = await getCompletedLessonIds(
    student.user.id,
    data.lessons.map((lesson) => lesson.id)
  );
  const unlock = isLessonUnlocked(data.lessons, data.lesson.id, completedIds);

  if (data.program.comingSoon) {
    return (
      <ProgramContentLocked
        locale={locale}
        programSlug={params.programSlug}
        labels={{
          title: t.memberPortal.programComingSoonTitle,
          body: t.memberPortal.programComingSoonBody,
          backToProgram: t.memberPortal.lessonLockedBackToProgram,
        }}
      />
    );
  }

  if (!unlock.unlocked && unlock.previousLesson) {
    return (
      <LessonLocked
        locale={locale}
        programSlug={params.programSlug}
        previousLessonTitle={resolveLessonTitle(unlock.previousLesson, internal)}
        previousLessonHref={learnLessonPath(
          params.programSlug,
          unlock.previousLesson.id,
          locale
        )}
        labels={{
          title: t.memberPortal.lessonLockedTitle,
          body: t.memberPortal.lessonLockedBody,
          backToProgram: t.memberPortal.lessonLockedBackToProgram,
          goToPrevious: t.memberPortal.lessonLockedGoToPrevious,
        }}
      />
    );
  }

  if (unlock.unlocked) {
    await touchLessonActivity(student.user.id, data.lesson.id);
  }

  const sortedLessons = [...data.lessons].sort((a, b) => a.sortOrder - b.sortOrder);
  const lessonIndex = sortedLessons.findIndex((l) => l.id === data.lesson.id);
  const prev = lessonIndex > 0 ? sortedLessons[lessonIndex - 1] : null;
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
    lessonType === "quiz"
      ? await getQuizForStudent(data.lesson.id, internal)
      : [];

  const quizIntroHtml =
    lessonType === "quiz" && body.trim()
      ? sanitizeLessonHtml(body)
      : "";

  const celebrationLabels = {
    title: t.memberPortal.programCompletedTitle,
    body: t.memberPortal.programCompletedBody,
    bodyWithCert: t.memberPortal.programCompletedBodyWithCert,
    rewatchHint: t.memberPortal.programCompletedRewatchHint,
    certificatesCta: t.memberPortal.programCompletedCertificatesCta,
    viewCertificateCta: t.memberPortal.certificateView,
  };
  const certificatesHref = learnCertificatesPath(locale);
  const programCertificateHref = learnProgramCertificatePath(params.programSlug, locale);
  const nextHref = next
    ? learnLessonPath(params.programSlug, next.id, locale)
    : null;

  return (
    <div className="flex flex-col gap-5 pb-10 sm:gap-6">
      <StudentGlassCard>
        <StudentPortalButton
          href={learnProgramPath(params.programSlug, locale)}
          variant="secondary"
        >
          {programTitle}
        </StudentPortalButton>
        <p className="mt-5 student-section-title">{programTitle}</p>
        <h1 className="mt-2 font-dm text-4xl font-semibold text-cream sm:text-5xl">
          {title}
        </h1>
      </StudentGlassCard>

      {lessonType === "video" && (
        <StudentGlassCard className="!p-0 overflow-hidden">
          <LessonPlayer
            lessonId={data.lesson.id}
            videoUrl={data.lesson.videoUrl}
            lessonTitle={title}
            initialPosition={data.progress?.lastPositionSeconds ?? 0}
            completed={isCompleted}
            nextHref={nextHref}
            certificateEnabled={data.program.certificateEnabled}
            certificatesHref={certificatesHref}
            programCertificateHref={programCertificateHref}
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
            certificateEnabled={data.program.certificateEnabled}
            certificatesHref={certificatesHref}
            programCertificateHref={programCertificateHref}
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
            certificateEnabled={data.program.certificateEnabled}
            certificatesHref={certificatesHref}
            programCertificateHref={programCertificateHref}
            celebrationLabels={celebrationLabels}
            labels={quizLabels}
          />
        </StudentGlassCard>
      )}

      {prev ? (
        <StudentGlassCard className="flex flex-wrap items-center justify-between gap-3">
          <StudentPortalButton
            href={learnLessonPath(params.programSlug, prev.id, locale)}
            variant="secondary"
          >
            {t.memberPortal.previous}
          </StudentPortalButton>
        </StudentGlassCard>
      ) : null}
    </div>
  );
}
