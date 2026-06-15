import { notFound } from "next/navigation";
import { getCertificateOrganizationName } from "@/lib/members/certificate-config";
import {
  formatCertificateIssueDate,
  resolveCertificateProgramTitle,
} from "@/lib/members/certificate-utils";
import { getCertificateByNumber } from "@/lib/members/certificate-store";
import { urlLocaleToInternal, type UrlLocale } from "@/lib/i18n/config";
import { translations } from "@/lib/i18n/translations";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { locale: string; certificateNumber: string };
}) {
  const internal = urlLocaleToInternal(params.locale as UrlLocale);
  const t = translations[internal];
  return {
    title: t.memberPortal.certificateVerifyPageTitle,
    robots: { index: true, follow: true },
  };
}

export default async function CertificateVerifyPage({
  params,
}: {
  params: { locale: string; certificateNumber: string };
}) {
  const locale = params.locale as UrlLocale;
  const internal = urlLocaleToInternal(locale);
  const t = translations[internal];
  const organization = getCertificateOrganizationName();

  const certificate = await getCertificateByNumber(
    decodeURIComponent(params.certificateNumber)
  );
  if (!certificate) notFound();

  const programTitle = resolveCertificateProgramTitle(certificate, internal);
  const issueDate = formatCertificateIssueDate(certificate.issuedAt, internal);

  return (
    <main className="min-h-screen bg-background px-4 pb-16 pt-28 sm:px-6 sm:pt-32 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <header className="text-center">
          <h1 className="font-dm text-2xl font-semibold text-orange sm:text-3xl">
            {t.memberPortal.certificateVerifyPageTitle}
          </h1>
        </header>

        <div className="mt-10 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center sm:p-8">
          <div
            className="certificate-verify-badge mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-500/20"
            aria-hidden
          >
            <svg
              viewBox="0 0 48 48"
              className="h-9 w-9 text-emerald-300"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="24"
                cy="24"
                r="22"
                className="certificate-verify-ring"
                stroke="currentColor"
                strokeWidth="2"
                opacity="0.35"
              />
              <path
                d="M14 24.5L21 31.5L34 17.5"
                className="certificate-verify-tick"
                pathLength="1"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-emerald-300">
            {t.memberPortal.certificateVerifyApprovedLabel}
          </p>
          <p className="mt-4 font-dm text-lg leading-relaxed text-cream sm:text-xl">
            {t.memberPortal.certificateVerifyApprovedBody.replace("{organization}", organization)}
          </p>

          <dl className="mt-8 space-y-3 border-t border-white/10 pt-6 text-start font-dm text-sm text-cream/75">
            <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
              <dt className="text-cream/45">{t.memberPortal.certificateCredentialId}</dt>
              <dd className="font-mono text-orange">{certificate.certificateNumber}</dd>
            </div>
            <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
              <dt className="text-cream/45">{t.memberPortal.certificateAwardedTo}</dt>
              <dd>{certificate.studentName}</dd>
            </div>
            <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
              <dt className="text-cream/45">{t.memberPortal.certificateForCompleting}</dt>
              <dd>{programTitle}</dd>
            </div>
            <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
              <dt className="text-cream/45">{t.memberPortal.certificateIssuedOn}</dt>
              <dd>{issueDate}</dd>
            </div>
          </dl>
        </div>
      </div>
    </main>
  );
}
