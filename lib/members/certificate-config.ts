import type { LocaleCode } from "@/lib/supabase/database.types";

/** Certificates are always rendered in English (layout, labels, dates). */
export const CERTIFICATE_DISPLAY_LOCALE: LocaleCode = "EN";

export function getCertificateSignatoryName(): string {
  return process.env.CERTIFICATE_SIGNATORY_NAME?.trim() || "Milad";
}

export function getCertificateOrganizationName(): string {
  return process.env.CERTIFICATE_ORGANIZATION_NAME?.trim() || "MX AI Academy";
}

/** Issuing org as it appears on LinkedIn (fallback when organization ID is not set). */
export function getCertificateLinkedInOrganizationName(): string {
  return (
    process.env.CERTIFICATE_LINKEDIN_ORGANIZATION_NAME?.trim() || "MX AI ACADEMY"
  );
}

/**
 * Numeric LinkedIn company page ID (from linkedin.com/company/12345678/admin/).
 * When set, LinkedIn auto-selects your organization instead of showing a dropdown.
 */
export function getCertificateLinkedInOrganizationId(): string | null {
  const raw = process.env.CERTIFICATE_LINKEDIN_ORGANIZATION_ID?.trim();
  if (!raw) return null;
  return /^\d+$/.test(raw) ? raw : null;
}

export function getCertificateSignatureImageUrl(): string | null {
  const url = process.env.CERTIFICATE_SIGNATURE_IMAGE_URL?.trim();
  if (!url) return null;
  // Same-origin proxy — external hosts often omit CORS headers, which breaks
  // crossOrigin img loads and html2canvas exports.
  return "/api/certificate-signature";
}
