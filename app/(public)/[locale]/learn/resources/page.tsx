import { redirect } from "next/navigation";
import StudentGlassCard from "@/components/members/StudentGlassCard";
import StudentPortalButton from "@/components/members/StudentPortalButton";
import { collectUsefulLinks } from "@/lib/members/learn-content";
import { accountLoginPath } from "@/lib/members/paths";
import { getStudentDashboard } from "@/lib/members/store";
import { urlLocaleToInternal, type UrlLocale } from "@/lib/i18n/config";
import { getStudentUser } from "@/lib/supabase/require-student";
import { translations } from "@/lib/i18n/translations";

export const dynamic = "force-dynamic";

export default async function LearnResourcesPage({
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
  const usefulLinks = collectUsefulLinks(programs);

  return (
    <div className="flex flex-col gap-5 pb-10 sm:gap-6">
      <StudentGlassCard>
        <h1 className="font-dm text-2xl font-semibold text-cream sm:text-3xl">
          {t.memberPortal.navResources}
        </h1>
        <p className="mt-2 font-dm text-sm text-cream/60">{t.memberPortal.resourcesPageSubtitle}</p>
      </StudentGlassCard>

      <StudentGlassCard>
        {usefulLinks.length === 0 ? (
          <p className="font-dm text-sm text-cream/55">{t.memberPortal.noResources}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {usefulLinks.map((link) => (
              <li
                key={link.url}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-4"
              >
                <div className="min-w-0">
                  <p className="font-dm text-base font-semibold text-cream">{link.label}</p>
                  <p className="mt-1 truncate font-dm text-xs text-cream/50">{link.url}</p>
                </div>
                <StudentPortalButton href={link.url} variant="secondary" external>
                  {t.memberPortal.openLink}
                </StudentPortalButton>
              </li>
            ))}
          </ul>
        )}
      </StudentGlassCard>
    </div>
  );
}
