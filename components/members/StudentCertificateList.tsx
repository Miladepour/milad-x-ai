import { Award } from "lucide-react";
import StudentPortalButton from "@/components/members/StudentPortalButton";
import {
  formatCertificateHours,
  formatCertificateIssueDate,
  resolveCertificateProgramTitle,
} from "@/lib/members/certificate-utils";
import type { StudentCertificateListItem } from "@/lib/members/certificate-store";
import { learnProgramCertificatePath } from "@/lib/members/paths";
import type { UrlLocale } from "@/lib/i18n/config";
import type { LocaleCode } from "@/lib/supabase/database.types";

interface StudentCertificateListProps {
  items: StudentCertificateListItem[];
  locale: UrlLocale;
  internalLocale: LocaleCode;
  labels: {
    viewCertificate: string;
    issuedOn: string;
    credentialId: string;
    hours: string;
  };
}

export default function StudentCertificateList({
  items,
  locale,
  internalLocale,
  labels,
}: StudentCertificateListProps) {
  return (
    <ul className="grid gap-4 md:grid-cols-2">
      {items.map(({ certificate, programSlug, programTitle }) => {
        const title =
          resolveCertificateProgramTitle(certificate, internalLocale) || programTitle;

        return (
          <li key={certificate.id}>
            <article className="flex h-full flex-col rounded-xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-orange/30 hover:bg-white/[0.05]">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-orange/30 bg-orange/10 text-orange">
                  <Award className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="font-dm text-lg font-semibold leading-snug text-cream">
                    {title}
                  </h2>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-cream/45">
                    {labels.credentialId}: {certificate.certificateNumber}
                  </p>
                </div>
              </div>

              <dl className="mt-4 grid gap-2 font-dm text-sm text-cream/70">
                <div className="flex justify-between gap-3">
                  <dt>{labels.issuedOn}</dt>
                  <dd className="text-cream">
                    {formatCertificateIssueDate(certificate.issuedAt, internalLocale)}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>{labels.hours}</dt>
                  <dd className="text-cream">
                    {formatCertificateHours(certificate.totalHours, internalLocale)}
                  </dd>
                </div>
              </dl>

              <div className="mt-5">
                <StudentPortalButton
                  href={learnProgramCertificatePath(programSlug, locale)}
                  variant="primary"
                >
                  {labels.viewCertificate}
                </StudentPortalButton>
              </div>
            </article>
          </li>
        );
      })}
    </ul>
  );
}
