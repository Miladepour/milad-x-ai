import { notFound } from "next/navigation";
import StudentAccessEnded from "@/components/members/StudentAccessEnded";
import StudentProgramCompletionBanner from "@/components/members/StudentProgramCompletionBanner";
import StudentCertificateBadge from "@/components/members/StudentCertificateBadge";
import StudentGlassCard from "@/components/members/StudentGlassCard";
import StudentLessonCard from "@/components/members/StudentLessonCard";
import StudentPortalButton from "@/components/members/StudentPortalButton";
import { isEnrollmentActive } from "@/lib/members/access";
import {
  getStudentCertificateForProgram,
  issueCertificateIfEligible,
} from "@/lib/members/certificate-store";
import { buildLessonUnlockMap } from "@/lib/members/lesson-gating";
import { resolveLessonBody, resolveLessonTitle } from "@/lib/members/lesson-localized";
import {
  resolveProgramDescription,
  resolveProgramTitle,
} from "@/lib/members/program-localized";
import {
  learnCertificatesPath,
  learnLessonPath,
  learnPath,
  learnProgramCertificatePath,
} from "@/lib/members/paths";
import {
  getCompletedLessonIds,
  getStudentEnrollmentForProgram,
  getStudentProgram,
} from "@/lib/members/store";
import type { LessonType } from "@/lib/members/types";
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
  const unlockMap = buildLessonUnlockMap(data.lessons, completedIds);

  const typeLabels: Record<LessonType, string> = {
    video: t.memberPortal.lessonTypeVideo,
    text: t.memberPortal.lessonTypeText,
    quiz: t.memberPortal.lessonTypeQuiz,
  };

  const programTitle = resolveProgramTitle(data.program, internal);
  const programDescription = resolveProgramDescription(data.program, internal);

  const sortedLessons = [...data.lessons].sort((a, b) => a.sortOrder - b.sortOrder);

  let certificate =
    data.program.certificateEnabled
      ? await getStudentCertificateForProgram(student.user.id, data.program.id)
      : null;

  if (
    data.program.certificateEnabled &&
    data.progressPercent === 100 &&
    !certificate
  ) {
    certificate = await issueCertificateIfEligible(student.user.id, data.program.id);
  }

  const programCompleted = data.progressPercent === 100;
  const contentLocked = data.program.comingSoon;

  return (
    <div className="flex flex-col gap-5 pb-10 sm:gap-6">
      {contentLocked && (
        <StudentGlassCard className="border border-orange/25 bg-orange/5">
          <h2 className="font-dm text-lg font-semibold text-orange sm:text-xl">
            {t.memberPortal.programComingSoonTitle}
          </h2>
          <p className="mt-2 font-dm text-sm leading-relaxed text-cream/70">
            {t.memberPortal.programComingSoonBody}
          </p>
        </StudentGlassCard>
      )}

      {programCompleted && data.program.certificateEnabled && !contentLocked && (
        <StudentProgramCompletionBanner
          title={t.memberPortal.programCompletedTitle}
          body={
            certificate
              ? t.memberPortal.programCompletedBodyWithCert
              : t.memberPortal.programCompletedBody
          }
          rewatchHint={t.memberPortal.programCompletedRewatchHint}
          certificatesHref={learnCertificatesPath(locale)}
          certificatesCta={t.memberPortal.programCompletedCertificatesCta}
          certificateHref={
            certificate
              ? learnProgramCertificatePath(data.program.slug, locale)
              : null
          }
          viewCertificateCta={t.memberPortal.certificateView}
        />
      )}

      <StudentGlassCard>
        <StudentPortalButton href={learnPath(locale)} variant="secondary">
          {t.memberPortal.backToDashboard}
        </StudentPortalButton>
        <h1 className="mt-5 font-dm text-2xl font-semibold text-orange sm:text-3xl">
          {programTitle}
        </h1>
        <p className="mt-3 font-dm text-cream/70">{programDescription}</p>
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
        {data.program.certificateEnabled && (
          <div className="mt-5 flex flex-col items-start gap-3">
            <StudentCertificateBadge label={t.memberPortal.certificateIncluded} />
            <StudentPortalButton
              href={learnProgramCertificatePath(data.program.slug, locale)}
              variant="primary"
              disabled={!programCompleted}
            >
              {t.memberPortal.certificateView}
            </StudentPortalButton>
            {!programCompleted ? (
              <p className="font-dm text-sm text-cream/60">
                {t.memberPortal.certificateIncludedHint}
              </p>
            ) : null}
          </div>
        )}
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
            const unlock = unlockMap.get(lesson.id);
            const locked = contentLocked || !unlock?.unlocked;
            const completed = completedIds.has(lesson.id);

            return (
              <li key={lesson.id}>
                <StudentLessonCard
                  href={learnLessonPath(data.program.slug, lesson.id, locale)}
                  index={index}
                  title={resolveLessonTitle(lesson, internal)}
                  description={resolveLessonBody(lesson, internal)}
                  durationMinutes={lesson.durationMinutes}
                  openLabel={t.memberPortal.openLesson}
                  locked={locked}
                  lockedLabel={
                    contentLocked
                      ? t.memberPortal.programComingSoonShort
                      : t.memberPortal.lessonLockedTitle
                  }
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
