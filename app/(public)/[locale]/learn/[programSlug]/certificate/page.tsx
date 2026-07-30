import { notFound, redirect } from "next/navigation";
import { CERTIFICATE_DISPLAY_LOCALE } from "@/lib/members/certificate-config";
import CertificateDownloadButtons from "@/components/members/CertificateDownloadButtons";
import CertificateLinkedInButton from "@/components/members/CertificateLinkedInButton";
import ProgramCertificateView from "@/components/members/ProgramCertificateView";
import StudentGlassCard from "@/components/members/StudentGlassCard";
import StudentPortalButton from "@/components/members/StudentPortalButton";
import { getStudentCertificatePageBySlug } from "@/lib/members/certificate-store";
import {
  buildLinkedInCertificationUrl,
  certificateVerifyUrl,
  resolveCertificateProgramTitle,
} from "@/lib/members/certificate-utils";
import {
  accountLoginPath,
  learnCertificatesPath,
  learnProgramCertificatePath,
  learnProgramPath,
} from "@/lib/members/paths";
import { urlLocaleToInternal, type UrlLocale } from "@/lib/i18n/config";
import { getStudentUser } from "@/lib/supabase/require-student";
import { translations } from "@/lib/i18n/translations";

export const dynamic = "force-dynamic";

export default async function LearnProgramCertificatePage({
  params,
}: {
  params: { locale: string; programSlug: string };
}) {
  const locale = params.locale as UrlLocale;
  const internal = urlLocaleToInternal(locale);
  const t = translations[internal];

  const student = await getStudentUser();
  if (!student) {
    redirect(
      accountLoginPath(
        locale,
        learnProgramCertificatePath(params.programSlug, locale)
      )
    );
  }

  const data = await getStudentCertificatePageBySlug(
    student.user.id,
    params.programSlug
  );
  if (!data) notFound();

  if (!data.program.certificateEnabled) {
    redirect(
      data.enrollmentActive
        ? learnProgramPath(data.program.slug, locale)
        : learnCertificatesPath(locale)
    );
  }

  const { program, certificate, enrollmentActive } = data;
  const backHref = enrollmentActive
    ? learnProgramPath(program.slug, locale)
    : learnCertificatesPath(locale);
  const backLabel = enrollmentActive
    ? t.memberPortal.backToProgram
    : t.memberPortal.navCertificates;

  if (!certificate) {
    return (
      <div className="flex flex-col gap-5 pb-10">
        <StudentGlassCard>
          <StudentPortalButton href={backHref} variant="secondary">
            {backLabel}
          </StudentPortalButton>
          <h1 className="mt-5 font-dm text-2xl font-semibold text-orange">
            {t.memberPortal.certificateTitle}
          </h1>
          <p className="mt-3 font-dm text-cream/70">
            {t.memberPortal.certificateNotReady}
          </p>
        </StudentGlassCard>
      </div>
    );
  }

  const programTitle = resolveCertificateProgramTitle(
    certificate,
    CERTIFICATE_DISPLAY_LOCALE
  );
  const verifyUrl = certificateVerifyUrl(certificate.certificateNumber, "en");
  const linkedInProfileUrl = buildLinkedInCertificationUrl(certificate, {
    locale: CERTIFICATE_DISPLAY_LOCALE,
    programTitle,
  });
  const mp = translations.EN.memberPortal;

  return (
    <div className="flex flex-col gap-5 pb-10">
      <StudentGlassCard>
        <StudentPortalButton href={backHref} variant="secondary">
          {backLabel}
        </StudentPortalButton>
        <h1 className="mt-5 font-dm text-2xl font-semibold text-orange sm:text-3xl">
          {t.memberPortal.certificateTitle}
        </h1>
        <p className="mt-2 font-dm text-cream/70">{t.memberPortal.certificateSubtitle}</p>
      </StudentGlassCard>

      <ProgramCertificateView
        certificate={certificate}
        locale={CERTIFICATE_DISPLAY_LOCALE}
        labels={{
          presentedTo: mp.certificatePresentedTo,
          recognitionPrefix: mp.certificateRecognitionPrefix,
          badgeCertified: mp.certificateBadgeCertified,
          verticalLabel: mp.certificateVerticalLabel,
          quote: mp.certificateQuote,
          quoteFa: mp.certificateQuoteFa,
          footerTitle: mp.certificateFooterTitle,
          signatoryRole: mp.certificateSignatoryRole,
          credentialId: mp.certificateCredentialId,
        }}
        actions={
          <>
            <CertificateDownloadButtons
              certificateNumber={certificate.certificateNumber}
              labels={{
                downloadPng: t.memberPortal.certificateDownloadPng,
                downloadPdf: t.memberPortal.certificateDownloadPdf,
                downloadStory: t.memberPortal.certificateDownloadStory,
                downloadPost: t.memberPortal.certificateDownloadPost,
                downloadSocialHeading: t.memberPortal.certificateDownloadSocialHeading,
                downloadSocialMention: t.memberPortal.certificateDownloadSocialMention,
                downloading: t.memberPortal.certificateDownloading,
              }}
            />
            <div className="flex flex-wrap items-center justify-center gap-3">
              <CertificateLinkedInButton
                href={linkedInProfileUrl}
                label={t.memberPortal.certificateLinkedIn}
              />
              <StudentPortalButton href={verifyUrl} variant="secondary" external>
                {t.memberPortal.certificateVerifyLink}
              </StudentPortalButton>
            </div>
          </>
        }
      />
    </div>
  );
}
