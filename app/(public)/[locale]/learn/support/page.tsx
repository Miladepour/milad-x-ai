import { redirect } from "next/navigation";
import StudentGlassCard from "@/components/members/StudentGlassCard";
import StudentPortalButton from "@/components/members/StudentPortalButton";
import { accountLoginPath } from "@/lib/members/paths";
import {
  STUDENT_SUPPORT_EMAIL,
  STUDENT_SUPPORT_TELEGRAM_URL,
} from "@/lib/members/support-constants";
import { urlLocaleToInternal, type UrlLocale } from "@/lib/i18n/config";
import { getStudentUser } from "@/lib/supabase/require-student";
import { translations } from "@/lib/i18n/translations";

export const dynamic = "force-dynamic";

export default async function LearnSupportPage({
  params,
}: {
  params: { locale: string };
}) {
  const locale = params.locale as UrlLocale;
  const internal = urlLocaleToInternal(locale);
  const t = translations[internal];

  const student = await getStudentUser();
  if (!student) redirect(accountLoginPath(locale));

  const mailto = `mailto:${STUDENT_SUPPORT_EMAIL}`;

  return (
    <div className="flex flex-col gap-5 pb-10 sm:gap-6">
      <StudentGlassCard>
        <h1 className="font-dm text-2xl font-semibold text-cream sm:text-3xl">
          {t.memberPortal.navSupport}
        </h1>
        <p className="mt-2 font-dm text-sm text-cream/60">{t.memberPortal.supportPageSubtitle}</p>
      </StudentGlassCard>

      <StudentGlassCard>
        <p className="font-dm text-base leading-relaxed text-cream/80">
          {t.memberPortal.supportPageIntro}
        </p>

        <ul className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <li>
            <StudentPortalButton href={STUDENT_SUPPORT_TELEGRAM_URL} variant="primary" external>
              {t.memberPortal.supportTelegramCta}
            </StudentPortalButton>
          </li>
          <li>
            <StudentPortalButton href={mailto} variant="secondary" external>
              {t.memberPortal.supportEmailCta}
            </StudentPortalButton>
          </li>
        </ul>

        <p className="mt-5 font-dm text-sm text-cream/55">
          {t.memberPortal.supportEmailLabel}:{" "}
          <a
            href={mailto}
            className="text-orange transition-colors hover:text-cream"
          >
            {STUDENT_SUPPORT_EMAIL}
          </a>
        </p>
      </StudentGlassCard>
    </div>
  );
}
