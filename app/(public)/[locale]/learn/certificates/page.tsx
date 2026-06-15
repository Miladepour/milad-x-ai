import { redirect } from "next/navigation";
import StudentCertificateList from "@/components/members/StudentCertificateList";
import StudentGlassCard from "@/components/members/StudentGlassCard";
import {
  listStudentCertificatesWithPrograms,
  syncCertificatesForCompletedPrograms,
} from "@/lib/members/certificate-store";
import { accountLoginPath } from "@/lib/members/paths";
import { getStudentDashboard } from "@/lib/members/store";
import { urlLocaleToInternal, type UrlLocale } from "@/lib/i18n/config";
import { getStudentUser } from "@/lib/supabase/require-student";
import { translations } from "@/lib/i18n/translations";

export const dynamic = "force-dynamic";

export default async function LearnCertificatesPage({
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
  await syncCertificatesForCompletedPrograms(
    student.user.id,
    programs.map((item) => ({
      programId: item.program.id,
      certificateEnabled: item.program.certificateEnabled,
      progressPercent: item.progressPercent,
    }))
  );

  const certificates = await listStudentCertificatesWithPrograms(student.user.id);

  return (
    <div className="flex flex-col gap-5 pb-10 sm:gap-6">
      <StudentGlassCard>
        <h1 className="font-dm text-2xl font-semibold text-cream sm:text-3xl">
          {t.memberPortal.certificatesPageTitle}
        </h1>
        <p className="mt-2 font-dm text-sm text-cream/60">
          {t.memberPortal.certificatesPageSubtitle}
        </p>
      </StudentGlassCard>

      <StudentGlassCard>
        {certificates.length === 0 ? (
          <p className="font-dm text-sm text-cream/55">{t.memberPortal.noCertificates}</p>
        ) : (
          <StudentCertificateList
            items={certificates}
            locale={locale}
            internalLocale={internal}
            labels={{
              viewCertificate: t.memberPortal.certificateView,
              issuedOn: t.memberPortal.certificateIssuedOn,
              credentialId: t.memberPortal.certificateCredentialId,
              hours: t.memberPortal.certificateTotalHours,
            }}
          />
        )}
      </StudentGlassCard>
    </div>
  );
}
