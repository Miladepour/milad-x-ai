import { notFound } from "next/navigation";
import StudentAccessEnded from "@/components/members/StudentAccessEnded";
import LessonContent from "@/components/members/LessonContent";
import LessonPlayer from "@/components/members/LessonPlayer";
import StudentGlassCard from "@/components/members/StudentGlassCard";
import StudentPortalButton from "@/components/members/StudentPortalButton";
import { isEnrollmentActive } from "@/lib/members/access";
import { learnLessonPath, learnProgramPath } from "@/lib/members/paths";
import {
  getStudentEnrollmentForProgram,
  getStudentLesson,
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
          programTitle={enrollmentView.program.title}
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

  const lessonIndex = data.lessons.findIndex((l) => l.id === data.lesson.id);
  const prev = lessonIndex > 0 ? data.lessons[lessonIndex - 1] : null;
  const next =
    lessonIndex >= 0 && lessonIndex < data.lessons.length - 1
      ? data.lessons[lessonIndex + 1]
      : null;

  return (
    <div className="flex flex-col gap-5 pb-10 sm:gap-6">
      <StudentGlassCard>
        <StudentPortalButton
          href={learnProgramPath(params.programSlug, locale)}
          variant="secondary"
        >
          {data.program.title}
        </StudentPortalButton>
        <p className="mt-5 student-section-title">{data.program.title}</p>
        <h1 className="mt-2 font-dm text-4xl font-semibold text-cream sm:text-5xl">
          {data.lesson.title}
        </h1>
        <div className="lesson-content mt-4">
          <LessonContent content={data.lesson.description} />
        </div>
      </StudentGlassCard>

      <StudentGlassCard className="!p-0 overflow-hidden">
        <LessonPlayer
          lessonId={data.lesson.id}
          videoUrl={data.lesson.videoUrl}
          initialPosition={data.progress?.lastPositionSeconds ?? 0}
          completed={!!data.progress?.completedAt}
        />
      </StudentGlassCard>

      <StudentGlassCard className="flex flex-wrap items-center justify-between gap-3">
        {prev ? (
          <StudentPortalButton
            href={learnLessonPath(params.programSlug, prev.id, locale)}
            variant="secondary"
          >
            {t.memberPortal.previous}
          </StudentPortalButton>
        ) : (
          <span />
        )}
        {next ? (
          <StudentPortalButton
            href={learnLessonPath(params.programSlug, next.id, locale)}
            variant="primary"
          >
            {t.memberPortal.next}
          </StudentPortalButton>
        ) : null}
      </StudentGlassCard>
    </div>
  );
}
