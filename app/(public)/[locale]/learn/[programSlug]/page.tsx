import Link from "next/link";
import { notFound } from "next/navigation";
import MemberSignOutButton from "@/components/members/MemberSignOutButton";
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
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-28">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <Link
          href={learnPath(locale)}
          className="font-mono text-xs uppercase tracking-widest text-orange hover:text-cream"
        >
          ← {t.memberPortal.backToDashboard}
        </Link>
        <MemberSignOutButton label={t.memberPortal.signOut} />
      </div>

      <header>
        <h1 className="font-dm text-4xl font-semibold text-cream">{data.program.title}</h1>
        <p className="mt-3 font-dm text-cream/70">{data.program.description}</p>
        <p className="mt-4 font-mono text-xs uppercase tracking-widest text-cream/50">
          {t.memberPortal.progress}: {data.progressPercent}% ({data.completedLessons}/
          {data.totalLessons})
        </p>
      </header>

      {data.program.usefulLinks.length > 0 && (
        <section className="border border-surface bg-surface/20 p-5">
          <h2 className="font-mono text-xs uppercase tracking-widest text-orange">
            {t.memberPortal.usefulLinks}
          </h2>
          <ul className="mt-3 flex flex-col gap-2">
            {data.program.usefulLinks.map((link) => (
              <li key={link.url}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-dm text-sm text-orange hover:underline"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="font-mono text-xs uppercase tracking-widest text-orange">
          {t.memberPortal.lessonList}
        </h2>
        <ul className="mt-4 divide-y divide-surface border border-surface">
          {data.lessons.map((lesson, index) => (
            <li key={lesson.id}>
              <Link
                href={learnLessonPath(data.program.slug, lesson.id, locale)}
                className="flex items-center justify-between gap-4 p-4 hover:bg-surface/30"
              >
                <div>
                  <p className="font-mono text-[10px] text-orange">#{index + 1}</p>
                  <p className="font-dm text-cream">{lesson.title}</p>
                </div>
                <span className="font-mono text-xl text-orange">→</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
