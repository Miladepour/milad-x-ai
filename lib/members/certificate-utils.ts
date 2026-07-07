import {
  getCertificateLinkedInOrganizationId,
  getCertificateLinkedInOrganizationName,
} from "@/lib/members/certificate-config";
import { certificateVerifyPath } from "@/lib/members/paths";
import type { ProgramCertificate } from "@/lib/members/types";
import type { LocaleCode } from "@/lib/supabase/database.types";
import type { UrlLocale } from "@/lib/i18n/config";

export function resolveCertificateProgramTitle(
  certificate: ProgramCertificate,
  locale: LocaleCode
): string {
  if (locale === "FA") {
    return certificate.programTitleFa || certificate.programTitleEn;
  }
  return certificate.programTitleEn || certificate.programTitleFa;
}

export function formatCertificateHours(hours: number, locale: LocaleCode): string {
  const rounded = Math.round(hours * 10) / 10;
  const value = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  return locale === "FA" ? `${value} ساعت` : `${value} hours`;
}

export function formatCertificateIssueDate(iso: string, locale: LocaleCode): string {
  const dateLocale = locale === "FA" ? "fa-IR" : "en-GB";
  return new Intl.DateTimeFormat(dateLocale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export function certificateVerifyUrl(
  certificateNumber: string,
  locale: UrlLocale = "en"
): string {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "https://www.mxaiacademy.com";
  return `${siteUrl}${certificateVerifyPath(certificateNumber, locale)}`;
}

export function buildLinkedInCertificationUrl(
  certificate: ProgramCertificate,
  opts: { locale: LocaleCode; programTitle: string }
): string {
  const issued = new Date(certificate.issuedAt);
  const urlLocale: UrlLocale = opts.locale === "FA" ? "fa" : "en";
  const params = new URLSearchParams({
    startTask: "CERTIFICATION_NAME",
    name: opts.programTitle,
    issueYear: String(issued.getUTCFullYear()),
    issueMonth: String(issued.getUTCMonth() + 1),
    certId: certificate.certificateNumber,
    certUrl: certificateVerifyUrl(certificate.certificateNumber, urlLocale),
  });

  // LinkedIn accepts organizationId OR organizationName — not both.
  // organizationId links the cert to your company page with logo (no manual click).
  const organizationId = getCertificateLinkedInOrganizationId();
  if (organizationId) {
    params.set("organizationId", organizationId);
  } else {
    params.set("organizationName", getCertificateLinkedInOrganizationName());
  }

  return `https://www.linkedin.com/profile/add?${params.toString()}`;
}

export interface CertificateNameTypography {
  fontSize: number;
  lineHeight: number;
  lines: string[];
}

function splitCertificateNameLines(
  name: string,
  maxLines: number,
  maxCharsPerLine: number
): string[] {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [name];

  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;

    if (next.length > maxCharsPerLine && current) {
      lines.push(current);
      current = word;
      if (lines.length >= maxLines) {
        const tailStart = words.indexOf(word);
        lines[maxLines - 1] = words.slice(tailStart).join(" ");
        return lines.slice(0, maxLines);
      }
      continue;
    }

    if (word.length > maxCharsPerLine) {
      if (current) {
        lines.push(current);
        current = "";
      }
      let rest = word;
      while (rest.length > 0 && lines.length < maxLines) {
        lines.push(rest.slice(0, maxCharsPerLine));
        rest = rest.slice(maxCharsPerLine);
      }
      if (rest && lines.length > 0) {
        lines[lines.length - 1] = `${lines[lines.length - 1]}${rest}`;
      }
      continue;
    }

    current = next;
  }

  if (current) {
    lines.push(current);
  }

  return lines.slice(0, maxLines);
}

export function resolveCertificateNameTypography(opts: {
  displayName: string;
  baseFontSize: number;
  contentWidth: number;
  isFa: boolean;
  maxWidthRatio?: number;
}): CertificateNameTypography {
  const {
    displayName,
    baseFontSize,
    contentWidth,
    isFa,
    maxWidthRatio = 0.92,
  } = opts;
  const maxWidth = contentWidth * maxWidthRatio;
  const maxLines = 3;
  const minFontSize = Math.round(baseFontSize * 0.45);
  const charWidthFactor = isFa ? 0.52 : 0.58;

  for (let fontSize = baseFontSize; fontSize >= minFontSize; fontSize -= 1) {
    const charsPerLine = Math.max(
      8,
      Math.floor(maxWidth / (fontSize * charWidthFactor))
    );
    const lines = splitCertificateNameLines(displayName, maxLines, charsPerLine);
    const fitsWidth = lines.every((line) => line.length <= charsPerLine + 2);
    const fitsLines = lines.length <= maxLines;

    if (fitsWidth && fitsLines) {
      return {
        fontSize,
        lineHeight: lines.length > 1 ? (isFa ? 1.18 : 1.1) : isFa ? 1.15 : 1.05,
        lines,
      };
    }
  }

  const charsPerLine = Math.max(
    8,
    Math.floor(maxWidth / (minFontSize * charWidthFactor))
  );

  return {
    fontSize: minFontSize,
    lineHeight: isFa ? 1.18 : 1.1,
    lines: splitCertificateNameLines(displayName, maxLines, charsPerLine),
  };
}

export function buildLinkedInPostShareText(opts: {
  programTitle: string;
  verifyUrl?: string;
}): string {
  const organization = getCertificateLinkedInOrganizationName();
  const lines = [
    `I'm pleased to share that I have received my certificate for ${opts.programTitle} from @${organization}`,
  ];
  if (opts.verifyUrl) {
    lines.push("", opts.verifyUrl);
  }
  return lines.join("\n");
}
