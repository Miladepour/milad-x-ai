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
