import Link from "next/link";
import { notFound } from "next/navigation";
import LessonPlayer from "@/components/members/LessonPlayer";
import MemberSignOutButton from "@/components/members/MemberSignOutButton";
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
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-28">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <Link
          href={learnProgramPath(params.programSlug, locale)}
          className="font-mono text-xs uppercase tracking-widest text-orange hover:text-cream"
        >
          ← {data.program.title}
        </Link>
        <MemberSignOutButton label={t.memberPortal.signOut} />
      </div>

      <header>
        <p className="font-mono text-xs uppercase tracking-widest text-orange">
          {data.program.title}
        </p>
        <h1 className="mt-2 font-dm text-3xl font-semibold text-cream">
          {data.lesson.title}
        </h1>
        {data.lesson.description && (
          <p className="mt-3 font-dm text-cream/70 whitespace-pre-wrap">
            {data.lesson.description}
          </p>
        )}
      </header>

      <LessonPlayer
        lessonId={data.lesson.id}
        videoUrl={data.lesson.videoUrl}
        initialPosition={data.progress?.lastPositionSeconds ?? 0}
        completed={!!data.progress?.completedAt}
      />

      <nav className="flex flex-wrap justify-between gap-3 border-t border-surface pt-6">
        {prev ? (
          <Link
            href={learnLessonPath(params.programSlug, prev.id, locale)}
            className="font-mono text-xs uppercase tracking-widest text-cream hover:text-orange"
          >
            ← {t.memberPortal.previous}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={learnLessonPath(params.programSlug, next.id, locale)}
            className="font-mono text-xs uppercase tracking-widest text-orange hover:text-cream"
          >
            {t.memberPortal.next} →
          </Link>
        ) : null}
      </nav>
    </div>
  );
}
