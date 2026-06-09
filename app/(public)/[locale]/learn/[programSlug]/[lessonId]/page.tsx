import Link from "next/link";
import { notFound } from "next/navigation";
import LessonContent from "@/components/members/LessonContent";
import LessonPlayer from "@/components/members/LessonPlayer";
import StudentGlassCard from "@/components/members/StudentGlassCard";
import { learnLessonPath, learnProgramPath } from "@/lib/members/paths";
import { getStudentLesson } from "@/lib/members/store";
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
  if (!data) notFound();

  const lessonIndex = data.lessons.findIndex((l) => l.id === data.lesson.id);
  const prev = lessonIndex > 0 ? data.lessons[lessonIndex - 1] : null;
  const next =
    lessonIndex >= 0 && lessonIndex < data.lessons.length - 1
      ? data.lessons[lessonIndex + 1]
      : null;

  return (
    <div className="flex flex-col gap-5 pb-10 sm:gap-6">
      <StudentGlassCard>
        <Link
          href={learnProgramPath(params.programSlug, locale)}
          className="font-mono text-[10px] uppercase tracking-widest text-orange hover:text-cream"
        >
          ← {data.program.title}
        </Link>
        <p className="mt-4 student-section-title">{data.program.title}</p>
        <h1 className="mt-2 font-dm text-3xl font-semibold text-cream">{data.lesson.title}</h1>
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

      <StudentGlassCard className="flex flex-wrap justify-between gap-3">
        {prev ? (
          <Link
            href={learnLessonPath(params.programSlug, prev.id, locale)}
            className="font-mono text-[10px] uppercase tracking-widest text-cream hover:text-orange"
          >
            ← {t.memberPortal.previous}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={learnLessonPath(params.programSlug, next.id, locale)}
            className="font-mono text-[10px] uppercase tracking-widest text-orange hover:text-cream"
          >
            {t.memberPortal.next} →
          </Link>
        ) : null}
      </StudentGlassCard>
    </div>
  );
}
