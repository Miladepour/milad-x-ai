import {
  getCertificateOrganizationName,
  getCertificateSignatoryName,
  getCertificateSignatureImageUrl,
} from "@/lib/members/certificate-config";
import {
  type CertificateFormat,
  getCertificateElementId,
  getCertificateLayoutTokens,
} from "@/lib/members/certificate-layout";
import {
  formatCertificateHours,
  formatCertificateIssueDate,
  resolveCertificateProgramTitle,
} from "@/lib/members/certificate-utils";
import type { ProgramCertificate } from "@/lib/members/types";
import type { LocaleCode } from "@/lib/supabase/database.types";

export interface CertificateDocumentLabels {
  presentedTo: string;
  recognitionPrefix: string;
  badgeCertified: string;
  verticalLabel: string;
  quote: string;
  quoteFa: string;
  footerTitle: string;
  signatoryRole: string;
  credentialId: string;
}

interface CertificateDocumentProps {
  certificate: ProgramCertificate;
  locale: LocaleCode;
  labels: CertificateDocumentLabels;
  format: CertificateFormat;
  className?: string;
}

function CertificateNoiseBackground() {
  return (
    <>
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[#0D0D0D]" />
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
  tokens,
}: {
  label: string;
  isFa: boolean;
  tokens: ReturnType<typeof getCertificateLayoutTokens>;
}) {
  const displayLabel = isFa ? label : label.toUpperCase();

  return (
    <div
      aria-hidden
      className="certificate-vertical-label pointer-events-none absolute end-0 top-0 z-20 flex items-center justify-center"
      style={{
        width: tokens.verticalLabelWidth,
        height: tokens.verticalLabelHeight,
      }}
    >
      <span
        className="inline-block rotate-180 px-0.5 text-cream [writing-mode:vertical-lr]"
        style={{
          fontFamily: isFa ? "var(--font-dm), sans-serif" : "var(--font-cormorant), serif",
          fontSize: tokens.verticalLabelFontSize,
          fontWeight: isFa ? 700 : 600,
          letterSpacing: isFa ? "0.04em" : "0.18em",
          textTransform: isFa ? "none" : "uppercase",
          lineHeight: 1,
        }}
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
  format,
  tokens,
}: {
  organization: string;
  programTitle: string;
  certifiedLabel: string;
  isFa: boolean;
  format: CertificateFormat;
  tokens: ReturnType<typeof getCertificateLayoutTokens>;
}) {
  const orgLabel = isFa ? organization : organization.toUpperCase();
  const programLines = badgeProgramLines(
    isFa ? programTitle : programTitle.toUpperCase()
  );
  const certifiedText = isFa ? certifiedLabel : certifiedLabel.toUpperCase();
  const badgeFont = isFa
    ? "Vazirmatn, Tahoma, sans-serif"
    : "Poppins, ui-sans-serif, sans-serif";
  const foldId = `certBadgeFold-${format}`;
  const glowId = `certBadgeGlow-${format}`;

  return (
    <div
      aria-hidden
      className="certificate-badge relative inline-block shrink-0"
      style={{ width: tokens.badgeWidth }}
    >
      <svg viewBox="0 0 132 168" className="block h-auto w-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={foldId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF5C00" />
            <stop offset="55%" stopColor="#C2410C" />
            <stop offset="100%" stopColor="#1A1A1A" />
          </linearGradient>
          <linearGradient id={glowId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF5C00" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#FFB366" stopOpacity="0.35" />
          </linearGradient>
        </defs>

        <path
          d="M66 4 L124 28 L124 116 L66 162 L8 116 L8 28 Z"
          fill="#0A0A0A"
          stroke={`url(#${glowId})`}
          strokeWidth="1.5"
        />
        <path
          d="M8 116 L66 162 L124 116 L124 128 L66 162 L8 128 Z"
          fill={`url(#${foldId})`}
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
        className="pointer-events-none absolute left-1/2 top-[14%] w-auto max-w-[38%] -translate-x-1/2 object-contain"
        style={{ height: tokens.badgeLogoHeight }}
      />
    </div>
  );
}

function CertificateFooter({
  signatory,
  organization,
  signatureUrl,
  issueDate,
  certificateNumber,
  labels,
  isFa,
  tokens,
}: {
  signatory: string;
  organization: string;
  signatureUrl: string | null;
  issueDate: string;
  certificateNumber: string;
  labels: CertificateDocumentLabels;
  isFa: boolean;
  tokens: ReturnType<typeof getCertificateLayoutTokens>;
}) {
  return (
    <div
      className="flex items-end justify-between"
      style={{ gap: tokens.footerGap }}
    >
      <div className="min-w-0" style={{ maxWidth: "42%" }}>
        {signatureUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={signatureUrl}
            alt=""
            className="mb-1 w-auto object-contain object-left rtl:object-right"
            style={{
              height: tokens.signatureHeight,
              maxWidth: tokens.signatureMaxWidth,
            }}
          />
        ) : null}
        <div className="mb-2 h-px bg-cream/35" style={{ width: tokens.signatureMaxWidth * 0.7 }} />
        <p
          className="font-semibold text-cream"
          style={{ fontSize: tokens.footerNameFontSize, fontFamily: "var(--font-dm), sans-serif" }}
        >
          {signatory}
        </p>
        <p
          className="uppercase tracking-[0.12em] text-cream/55"
          style={{
            fontSize: tokens.footerRoleFontSize,
            fontFamily: "ui-monospace, monospace",
          }}
        >
          {labels.signatoryRole}
        </p>
        <p
          className="mt-0.5 text-cream/45"
          style={{ fontSize: tokens.footerOrgFontSize, fontFamily: "var(--font-dm), sans-serif" }}
        >
          {organization}
        </p>
      </div>

      <div className="flex shrink-0 flex-col items-end text-end">
        <p
          className="uppercase tracking-[0.12em] text-cream/80"
          style={{
            fontSize: tokens.footerMetaFontSize,
            fontFamily: "ui-monospace, monospace",
          }}
        >
          {issueDate}
        </p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/miladxailogo9.png"
          alt={organization}
          crossOrigin="anonymous"
          className="mt-3 w-auto object-contain"
          style={{ height: tokens.logoHeight }}
        />
        <p
          className="mt-3 max-w-[11rem] uppercase leading-snug tracking-[0.14em] text-cream/80"
          style={{
            fontSize: tokens.footerTitleFontSize,
            fontFamily: "ui-monospace, monospace",
          }}
        >
          {labels.footerTitle}
        </p>
        <p
          className="mt-2 uppercase tracking-widest text-cream/45"
          style={{
            fontSize: tokens.footerCredentialFontSize,
            fontFamily: "ui-monospace, monospace",
          }}
        >
          {labels.credentialId}
        </p>
        <p
          className="mt-0.5 text-orange"
          style={{
            fontSize: tokens.footerNumberFontSize,
            fontFamily: "ui-monospace, monospace",
          }}
        >
          {certificateNumber}
        </p>
      </div>
    </div>
  );
}

function CertificateMainContent({
  displayName,
  programTitle,
  hoursDisplay,
  quote,
  labels,
  isFa,
  tokens,
  includeQuote = true,
}: {
  displayName: string;
  programTitle: string;
  hoursDisplay: string;
  quote: string;
  labels: CertificateDocumentLabels;
  isFa: boolean;
  tokens: ReturnType<typeof getCertificateLayoutTokens>;
  includeQuote?: boolean;
}) {
  return (
    <>
      <div className="flex flex-col items-center text-center">
        <p
          className="uppercase tracking-[0.2em] text-cream/80"
          style={{
            fontSize: tokens.presentedFontSize,
            fontFamily: "ui-monospace, monospace",
          }}
        >
          {labels.presentedTo}
        </p>

        <h1
          className="max-w-[92%] text-cream"
          style={{
            marginTop: tokens.nameMarginTop,
            fontSize: tokens.nameFontSize,
            lineHeight: isFa ? 1.15 : 1.05,
            fontFamily: isFa
              ? "var(--font-dm), sans-serif"
              : "var(--font-cormorant), serif",
            fontWeight: isFa ? 700 : 600,
            letterSpacing: isFa ? "0.01em" : "0.05em",
            textTransform: isFa ? "none" : "uppercase",
          }}
        >
          {displayName}
        </h1>

        <div style={{ marginTop: tokens.programBlockMarginTop, maxWidth: "88%" }}>
          <p
            className="uppercase tracking-[0.16em] text-cream/75"
            style={{
              fontSize: tokens.recognitionFontSize,
              lineHeight: 1.45,
              fontFamily: "ui-monospace, monospace",
            }}
          >
            {labels.recognitionPrefix}
          </p>
          <p
            className="text-cream"
            style={{
              marginTop: tokens.programTitleMarginTop,
              fontSize: tokens.programFontSize,
              lineHeight: tokens.programTitleLineHeight,
              fontFamily: "var(--font-dm), sans-serif",
              fontWeight: isFa ? 700 : 600,
              letterSpacing: isFa ? "0.01em" : "0.04em",
              textTransform: isFa ? "none" : "uppercase",
            }}
          >
            {programTitle}
          </p>
          <p
            className="uppercase tracking-[0.14em] text-cream/70"
            style={{
              marginTop: tokens.hoursMarginTop,
              fontSize: tokens.hoursFontSize,
              lineHeight: 1.4,
              fontFamily: "ui-monospace, monospace",
            }}
          >
            {hoursDisplay}
          </p>
        </div>
      </div>

      {includeQuote ? (
        <blockquote
          className="mx-auto text-center text-cream/75"
          style={{
            marginTop: tokens.quoteMarginTop,
            maxWidth: "88%",
            fontSize: tokens.quoteFontSize,
            lineHeight: tokens.quoteLineHeight,
            fontFamily: "var(--font-dm), sans-serif",
          }}
        >
          {quote}
        </blockquote>
      ) : null}
    </>
  );
}

function CertificateQuote({
  quote,
  tokens,
}: {
  quote: string;
  tokens: ReturnType<typeof getCertificateLayoutTokens>;
}) {
  return (
    <blockquote
      className="mx-auto text-center text-cream/75"
      style={{
        marginTop: tokens.quoteMarginTop,
        maxWidth: "88%",
        fontSize: tokens.quoteFontSize,
        lineHeight: tokens.quoteLineHeight,
        fontFamily: "var(--font-dm), sans-serif",
      }}
    >
      {quote}
    </blockquote>
  );
}

export default function CertificateDocument({
  certificate,
  locale,
  labels,
  format,
  className = "",
}: CertificateDocumentProps) {
  const tokens = getCertificateLayoutTokens(format);
  const programTitle = resolveCertificateProgramTitle(certificate, locale);
  const signatory = getCertificateSignatoryName();
  const organization = getCertificateOrganizationName();
  const signatureUrl = getCertificateSignatureImageUrl();
  const issueDate = formatCertificateIssueDate(certificate.issuedAt, locale);
  const hours = formatCertificateHours(certificate.totalHours, locale);
  const dir = locale === "FA" ? "rtl" : "ltr";
  const isFa = locale === "FA";
  const quote = isFa ? labels.quoteFa : labels.quote;

  const displayName = isFa
    ? certificate.studentName
    : certificate.studentName.toUpperCase();

  const hoursDisplay = `(${hours})`;
  const isPortrait = tokens.layout === "portrait";

  const contentStyle = {
    paddingInlineStart: tokens.paddingX,
    paddingInlineEnd: tokens.paddingX + tokens.contentInsetEnd,
    paddingTop: tokens.paddingTop,
    paddingBottom: tokens.paddingBottom,
  };

  return (
    <div
      id={getCertificateElementId(format)}
      dir={dir}
      className={`certificate-document relative overflow-hidden font-dm text-cream ${className}`}
      style={{
        width: tokens.width,
        height: tokens.height,
        boxShadow: format === "document" ? "0 24px 80px rgba(0,0,0,0.5)" : undefined,
      }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <CertificateNoiseBackground />
      </div>

      <CertificateVerticalLabel
        label={labels.verticalLabel}
        isFa={isFa}
        tokens={tokens}
      />

      {isPortrait ? (
        <div
          className="relative z-10 grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)_auto_auto]"
          style={contentStyle}
        >
          <div
            className="flex shrink-0 justify-center"
            style={{ marginTop: tokens.badgeOffsetTop }}
          >
            <CertificateBadge
              organization={organization}
              programTitle={programTitle}
              certifiedLabel={labels.badgeCertified}
              isFa={isFa}
              format={format}
              tokens={tokens}
            />
          </div>

          <div className="flex min-h-0 flex-col items-center justify-center py-2">
            <CertificateMainContent
              displayName={displayName}
              programTitle={programTitle}
              hoursDisplay={hoursDisplay}
              quote={quote}
              labels={labels}
              isFa={isFa}
              tokens={tokens}
              includeQuote={false}
            />
          </div>

          <div className="shrink-0">
            <CertificateQuote quote={quote} tokens={tokens} />
          </div>

          <div className="shrink-0">
            <CertificateFooter
              signatory={signatory}
              organization={organization}
              signatureUrl={signatureUrl}
              issueDate={issueDate}
              certificateNumber={certificate.certificateNumber}
              labels={labels}
              isFa={isFa}
              tokens={tokens}
            />
          </div>
        </div>
      ) : (
        <div
          className="relative z-10 grid h-full grid-rows-[auto_minmax(0,1fr)_auto_auto]"
          style={contentStyle}
        >
          <div className="flex justify-start">
            <CertificateBadge
              organization={organization}
              programTitle={programTitle}
              certifiedLabel={labels.badgeCertified}
              isFa={isFa}
              format={format}
              tokens={tokens}
            />
          </div>

          <div className="flex flex-col items-center justify-center px-4 text-center">
            <CertificateMainContent
              displayName={displayName}
              programTitle={programTitle}
              hoursDisplay={hoursDisplay}
              quote={quote}
              labels={labels}
              isFa={isFa}
              tokens={tokens}
              includeQuote={false}
            />
          </div>

          <CertificateQuote quote={quote} tokens={tokens} />

          <CertificateFooter
            signatory={signatory}
            organization={organization}
            signatureUrl={signatureUrl}
            issueDate={issueDate}
            certificateNumber={certificate.certificateNumber}
            labels={labels}
            isFa={isFa}
            tokens={tokens}
          />
        </div>
      )}
    </div>
  );
}
