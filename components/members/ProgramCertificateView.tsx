import {
  getCertificateOrganizationName,
  getCertificateSignatoryName,
  getCertificateSignatureImageUrl,
} from "@/lib/members/certificate-config";
import {
  formatCertificateHours,
  formatCertificateIssueDate,
  resolveCertificateProgramTitle,
} from "@/lib/members/certificate-utils";
import type { ProgramCertificate } from "@/lib/members/types";
import type { LocaleCode } from "@/lib/supabase/database.types";

interface ProgramCertificateViewProps {
  certificate: ProgramCertificate;
  locale: LocaleCode;
  labels: {
    presentedTo: string;
    recognitionPrefix: string;
    badgeCertified: string;
    verticalLabel: string;
    quote: string;
    quoteFa: string;
    footerTitle: string;
    signatoryRole: string;
    credentialId: string;
  };
  actions?: React.ReactNode;
}

function CertificateNoiseBackground() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[#0D0D0D]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_12%_88%,rgba(255,92,0,0.55)_0%,rgba(255,92,0,0.12)_38%,transparent_68%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_45%_at_92%_18%,rgba(255,92,0,0.14)_0%,transparent_55%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/70"
      />
      <div
        aria-hidden
        className="certificate-noise-overlay pointer-events-none absolute inset-0 opacity-[0.18] mix-blend-soft-light"
      />
    </>
  );
}

function badgeProgramLines(title: string, maxLines = 2, maxLen = 16): string[] {
  const words = title.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [title];

  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxLen && current) {
      lines.push(current);
      current = word;
      if (lines.length >= maxLines) break;
    } else {
      current = next;
    }
  }

  if (lines.length < maxLines && current) {
    lines.push(current);
  }

  return lines.slice(0, maxLines);
}

function CertificateVerticalLabel({
  label,
  isFa,
}: {
  label: string;
  isFa: boolean;
}) {
  const displayLabel = isFa ? label : label.toUpperCase();

  return (
    <div
      aria-hidden
      className="certificate-vertical-label pointer-events-none absolute right-0 top-0 z-20 flex h-[44%] min-h-[9.5rem] w-8 items-center justify-center sm:min-h-[11rem] sm:w-10"
    >
      <span
        className={`inline-block rotate-180 px-0.5 text-cream [writing-mode:vertical-lr] ${
          isFa
            ? "font-dm text-sm font-bold tracking-wide sm:text-base"
            : "font-cormorant text-[1.65rem] font-semibold uppercase leading-none tracking-[0.18em] sm:text-[1.9rem]"
        }`}
      >
        {displayLabel}
      </span>
    </div>
  );
}

function CertificateBadge({
  organization,
  programTitle,
  certifiedLabel,
  isFa,
}: {
  organization: string;
  programTitle: string;
  certifiedLabel: string;
  isFa: boolean;
}) {
  const orgLabel = isFa ? organization : organization.toUpperCase();
  const programLines = badgeProgramLines(
    isFa ? programTitle : programTitle.toUpperCase()
  );
  const certifiedText = isFa ? certifiedLabel : certifiedLabel.toUpperCase();
  const badgeFont = isFa
    ? "Vazirmatn, Tahoma, sans-serif"
    : "Poppins, ui-sans-serif, sans-serif";

  return (
    <div
      aria-hidden
      className="certificate-badge relative inline-block w-[104px] shrink-0 sm:w-[124px]"
    >
      <svg
        viewBox="0 0 132 168"
        className="block h-auto w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="certBadgeFold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF5C00" />
            <stop offset="55%" stopColor="#C2410C" />
            <stop offset="100%" stopColor="#1A1A1A" />
          </linearGradient>
          <linearGradient id="certBadgeGlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF5C00" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#FFB366" stopOpacity="0.35" />
          </linearGradient>
        </defs>

        <path
          d="M66 4 L124 28 L124 116 L66 162 L8 116 L8 28 Z"
          fill="#0A0A0A"
          stroke="url(#certBadgeGlow)"
          strokeWidth="1.5"
        />
        <path
          d="M8 116 L66 162 L124 116 L124 128 L66 162 L8 128 Z"
          fill="url(#certBadgeFold)"
          opacity="0.95"
        />
        <path
          d="M66 116 L124 116 L124 128 L66 162 Z"
          fill="#000000"
          opacity="0.35"
        />

        <text
          x="66"
          y="58"
          textAnchor="middle"
          fill="#FF5C00"
          fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
          fontSize="6.5"
          letterSpacing="1.2"
        >
          {orgLabel.length > 22 ? `${orgLabel.slice(0, 20)}…` : orgLabel}
        </text>

        {programLines.map((line, index) => (
          <text
            key={`${line}-${index}`}
            x="66"
            y={74 + index * 9}
            textAnchor="middle"
            fill="#F5F0E8"
            fontFamily={badgeFont}
            fontSize="7.5"
            fontWeight="600"
            letterSpacing="0.4"
          >
            {line}
          </text>
        ))}

        <text
          x="66"
          y="128"
          textAnchor="middle"
          fill="#F5F0E8"
          fontFamily={badgeFont}
          fontSize="11"
          fontWeight="700"
          letterSpacing="0.8"
        >
          {certifiedText}
        </text>

        <path
          d="M58 144 L63 149 L74 138"
          fill="none"
          stroke="#F5F0E8"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.9"
        />
      </svg>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/miladxailogo9.png"
        alt=""
        className="pointer-events-none absolute left-1/2 top-[14%] h-[18px] w-auto max-w-[38%] -translate-x-1/2 object-contain sm:h-[21px]"
      />
    </div>
  );
}

export default function ProgramCertificateView({
  certificate,
  locale,
  labels,
  actions,
}: ProgramCertificateViewProps) {
  const programTitle = resolveCertificateProgramTitle(certificate, locale);
  const signatory = getCertificateSignatoryName();
  const organization = getCertificateOrganizationName();
  const signatureUrl = getCertificateSignatureImageUrl();
  const issueDate = formatCertificateIssueDate(certificate.issuedAt, locale);
  const hours = formatCertificateHours(certificate.totalHours, locale);
  const dir = locale === "FA" ? "rtl" : "ltr";
  const isFa = locale === "FA";

  const displayName = isFa
    ? certificate.studentName
    : certificate.studentName.toUpperCase();

  const hoursDisplay = `(${hours})`;

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div
        id="program-certificate"
        dir={dir}
        className="certificate-document relative aspect-[297/210] w-full overflow-hidden font-dm text-cream shadow-[0_24px_80px_rgba(0,0,0,0.5)]"
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <CertificateNoiseBackground />
        </div>

        <CertificateVerticalLabel label={labels.verticalLabel} isFa={isFa} />

        <div className="relative z-10 grid h-full grid-rows-[auto_minmax(0,1fr)_auto_auto] px-7 py-5 sm:px-10 sm:py-7">
          <div className="flex justify-start pe-10 sm:pe-12">
            <CertificateBadge
              organization={organization}
              programTitle={programTitle}
              certifiedLabel={labels.badgeCertified}
              isFa={isFa}
            />
          </div>

          <div className="flex flex-col items-center justify-center px-4 text-center sm:px-12">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-cream/80 sm:text-sm">
              {labels.presentedTo}
            </p>

            <h1
              className={`mt-4 max-w-[92%] text-cream sm:mt-5 ${
                isFa
                  ? "font-dm text-4xl font-bold leading-tight sm:text-5xl"
                  : "font-cormorant text-5xl font-semibold uppercase leading-[1.05] tracking-[0.05em] sm:text-6xl"
              }`}
            >
              {displayName}
            </h1>

            <div className="mt-6 max-w-2xl sm:mt-8">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-cream/75 sm:text-xs">
                {labels.recognitionPrefix}
              </p>
              <p
                className={`mt-3 text-cream ${
                  isFa
                    ? "font-dm text-2xl font-bold leading-snug sm:text-3xl"
                    : "font-dm text-xl font-semibold uppercase leading-snug tracking-[0.04em] sm:text-2xl"
                }`}
              >
                {programTitle}
              </p>
              <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-cream/70 sm:text-xs">
                {hoursDisplay}
              </p>
            </div>
          </div>

          <blockquote className="mx-auto max-w-2xl px-4 text-center font-dm text-xs leading-relaxed text-cream/75 sm:text-sm">
            {labels.quote}
          </blockquote>

          <div className="flex items-end justify-between gap-6 sm:gap-10">
            <div className="min-w-0 max-w-[42%]">
              {signatureUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={signatureUrl}
                  alt=""
                  className="mb-1 h-12 w-auto max-w-[180px] object-contain object-left rtl:object-right sm:h-16"
                />
              ) : null}
              <div className="mb-2 h-px w-28 bg-cream/35 sm:w-32" />
              <p className="font-dm text-sm font-semibold text-cream sm:text-base">
                {signatory}
              </p>
              <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-cream/55 sm:text-[10px]">
                {labels.signatoryRole}
              </p>
              <p className="mt-0.5 font-dm text-[11px] text-cream/45">{organization}</p>
            </div>

            <div className="flex shrink-0 flex-col items-end text-end">
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-cream/80 sm:text-xs">
                {issueDate}
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/miladxailogo9.png"
                alt={organization}
                crossOrigin="anonymous"
                className="mt-3 h-9 w-auto object-contain sm:h-11"
              />
              <p className="mt-3 max-w-[11rem] font-mono text-[9px] uppercase leading-snug tracking-[0.14em] text-cream/80 sm:text-[10px]">
                {labels.footerTitle}
              </p>
              <p className="mt-2 font-mono text-[9px] uppercase tracking-widest text-cream/45">
                {labels.credentialId}
              </p>
              <p className="mt-0.5 font-mono text-[10px] text-orange sm:text-[11px]">
                {certificate.certificateNumber}
              </p>
            </div>
          </div>
        </div>
      </div>

      {actions ? (
        <div className="mt-6 flex flex-col items-center gap-4">{actions}</div>
      ) : null}
    </div>
  );
}
