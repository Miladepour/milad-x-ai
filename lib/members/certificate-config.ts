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

/** Default signature asset (override with CERTIFICATE_SIGNATURE_IMAGE_URL in env). */
export const DEFAULT_CERTIFICATE_SIGNATURE_IMAGE_URL =
  "https://sayclick.co.uk/wp-content/uploads/2026/06/milad-sign-for-certificate.png";

export function getCertificateSignatureSourceUrl(): string {
  return (
    process.env.CERTIFICATE_SIGNATURE_IMAGE_URL?.trim() ||
    DEFAULT_CERTIFICATE_SIGNATURE_IMAGE_URL
  );
}

export function getCertificateSignatureImageUrl(): string {
  // Same-origin proxy — external hosts often omit CORS headers, which breaks
  // crossOrigin img loads and html-to-image exports.
  return "/api/certificate-signature";
}
