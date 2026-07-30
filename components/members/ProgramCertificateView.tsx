import CertificateDocument, {
  type CertificateDocumentLabels,
} from "@/components/members/CertificateDocument";
import CertificatePreviewFrame from "@/components/members/CertificatePreviewFrame";
import type { ProgramCertificate } from "@/lib/members/types";
import type { LocaleCode } from "@/lib/supabase/database.types";

interface ProgramCertificateViewProps {
  certificate: ProgramCertificate;
  locale: LocaleCode;
  labels: CertificateDocumentLabels;
  actions?: React.ReactNode;
}

export default function ProgramCertificateView({
  certificate,
  locale,
  labels,
  actions,
}: ProgramCertificateViewProps) {
  return (
    <div className="relative mx-auto w-full min-w-0 max-w-5xl">
      <CertificatePreviewFrame>
        <CertificateDocument
          certificate={certificate}
          locale={locale}
          labels={labels}
          format="document"
        />
      </CertificatePreviewFrame>

      {/* Keep capture clones off-screen; never move them into the viewport during export. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-[-9999px] top-0 overflow-visible"
      >
        <CertificateDocument
          certificate={certificate}
          locale={locale}
          labels={labels}
          format="document"
          captureTarget
        />
        <CertificateDocument
          certificate={certificate}
          locale={locale}
          labels={labels}
          format="story"
          captureTarget
        />
        <CertificateDocument
          certificate={certificate}
          locale={locale}
          labels={labels}
          format="post"
          captureTarget
        />
      </div>

      {actions ? (
        <div className="mt-6 flex flex-col items-center gap-4">{actions}</div>
      ) : null}
    </div>
  );
}
