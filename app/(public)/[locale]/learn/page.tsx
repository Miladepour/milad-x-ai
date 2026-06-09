import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import MemberSignOutButton from "@/components/members/MemberSignOutButton";
import {
  accountLoginPath,
  learnLessonPath,
  learnProgramPath,
} from "@/lib/members/paths";
import { getStudentDashboard } from "@/lib/members/store";
import type { UsefulLink } from "@/lib/members/types";
import { urlLocaleToInternal, type UrlLocale } from "@/lib/i18n/config";
import { getStudentUser } from "@/lib/supabase/require-student";
import { translations } from "@/lib/i18n/translations";

export const dynamic = "force-dynamic";

export default async function LearnDashboardPage({
  params,
}: {
  params: { locale: string };
}) {
  const locale = params.locale as UrlLocale;
  const internal = urlLocaleToInternal(locale);
  const t = translations[internal];

  const student = await getStudentUser();
  if (!student) redirect(accountLoginPath(locale));

  const programs = await getStudentDashboard(student.user.id);

  const usefulLinks: UsefulLink[] = [];
  const seen = new Set<string>();
  for (const item of programs) {
    for (const link of item.program.usefulLinks) {
      if (!seen.has(link.url)) {
        seen.add(link.url);
        usefulLinks.push(link);
      }
    }
  }

  const continueItem = programs.find((p) => p.continueLesson);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-28">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-surface pb-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-orange">
            {t.memberPortal.dashboardTitle}
          </p>
          <h1 className="mt-2 font-dm text-4xl font-semibold text-cream">
            {t.memberPortal.welcome}, {student.profile.fullName || student.profile.email}
          </h1>
        </div>
        <MemberSignOutButton label={t.memberPortal.signOut} />
      </header>

      {continueItem?.continueLesson && (
        <section className="border border-orange/40 bg-orange/10 p-6">
          <p className="font-mono text-xs uppercase tracking-widest text-orange">
            {t.memberPortal.continueWatching}
          </p>
          <p className="mt-2 font-dm text-lg text-cream">
            {continueItem.continueLesson.title}
          </p>
          <p className="font-dm text-sm text-cream/60">{continueItem.program.title}</p>
          <Link
            href={learnLessonPath(
              continueItem.program.slug,
              continueItem.continueLesson.id,
              locale
            )}
            className="mt-4 inline-block bg-orange px-5 py-2 font-mono text-xs uppercase tracking-widest text-background hover:bg-cream"
          >
            {t.memberPortal.continueCta}
          </Link>
        </section>
      )}

      <section>
        <h2 className="font-mono text-xs uppercase tracking-widest text-orange">
          {t.memberPortal.myPrograms}
        </h2>
        {programs.length === 0 ? (
          <p className="mt-4 font-dm text-cream/70">{t.memberPortal.noPrograms}</p>
        ) : (
          <ul className="mt-4 grid gap-4 md:grid-cols-2">
            {programs.map((item) => (
              <li
                key={item.program.id}
                className="flex flex-col border border-surface bg-surface/25 p-5"
              >
                {item.program.coverImage && (
                  <div className="relative mb-4 aspect-video overflow-hidden bg-surface">
                    <Image
                      src={item.program.coverImage}
                      alt=""
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}
                <h3 className="font-dm text-xl font-semibold text-cream">
                  {item.program.title}
                </h3>
                <p className="mt-2 font-dm text-sm text-cream/60 line-clamp-2">
                  {item.program.description}
                </p>
                <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-cream/50">
                  {t.memberPortal.progress}: {item.progressPercent}% · {item.completedLessons}/
                  {item.totalLessons} {t.memberPortal.lessons}
                </p>
                <p className="font-dm text-xs text-cream/50">
                  {t.memberPortal.accessUntil}:{" "}
                  {item.enrollment.accessEndsAt
                    ? new Date(item.enrollment.accessEndsAt).toLocaleDateString(
                        internal === "FA" ? "fa-IR" : "en-GB"
                      )
                    : t.memberPortal.noExpiry}
                </p>
                <Link
                  href={learnProgramPath(item.program.slug, locale)}
                  className="mt-4 inline-block border border-orange px-4 py-2 font-mono text-xs uppercase tracking-widest text-orange hover:bg-orange hover:text-background"
                >
                  {t.memberPortal.viewProgram}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {usefulLinks.length > 0 && (
        <section>
          <h2 className="font-mono text-xs uppercase tracking-widest text-orange">
            {t.memberPortal.usefulLinks}
          </h2>
          <ul className="mt-4 flex flex-col gap-2">
            {usefulLinks.map((link) => (
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
    </div>
  );
}
