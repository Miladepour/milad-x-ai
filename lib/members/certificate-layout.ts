export type CertificateFormat = "document" | "story" | "post";

export interface CertificateDimensions {
  width: number;
  height: number;
}

export interface CertificateLayoutTokens {
  width: number;
  height: number;
  paddingX: number;
  paddingTop: number;
  paddingBottom: number;
  contentInsetEnd: number;
  badgeWidth: number;
  badgeLogoHeight: number;
  badgeOffsetTop: number;
  verticalLabelWidth: number;
  verticalLabelHeight: number;
  verticalLabelFontSize: number;
  presentedFontSize: number;
  nameFontSize: number;
  recognitionFontSize: number;
  programFontSize: number;
  hoursFontSize: number;
  quoteFontSize: number;
  quoteLineHeight: number;
  footerNameFontSize: number;
  footerRoleFontSize: number;
  footerOrgFontSize: number;
  footerMetaFontSize: number;
  footerTitleFontSize: number;
  footerCredentialFontSize: number;
  footerNumberFontSize: number;
  signatureHeight: number;
  signatureMaxWidth: number;
  logoHeight: number;
  nameMarginTop: number;
  programBlockMarginTop: number;
  programTitleMarginTop: number;
  hoursMarginTop: number;
  quoteMarginTop: number;
  programTitleLineHeight: number;
  footerGap: number;
  layout: "landscape" | "portrait";
}

export const CERTIFICATE_FORMATS: Record<CertificateFormat, CertificateDimensions> = {
  document: {
    width: 960,
    height: Math.round(960 * (210 / 297)),
  },
  story: {
    width: 1080,
    height: 1920,
  },
  post: {
    width: 1080,
    height: 1350,
  },
};

/** @deprecated Use CERTIFICATE_FORMATS.document */
export const CERTIFICATE_WIDTH = CERTIFICATE_FORMATS.document.width;
/** @deprecated Use CERTIFICATE_FORMATS.document */
export const CERTIFICATE_HEIGHT = CERTIFICATE_FORMATS.document.height;

export function getCertificateElementId(format: CertificateFormat): string {
  return format === "document" ? "program-certificate" : `program-certificate-${format}`;
}

export function getCertificateDimensions(format: CertificateFormat): CertificateDimensions {
  return CERTIFICATE_FORMATS[format];
}

export function getCertificateLayoutTokens(format: CertificateFormat): CertificateLayoutTokens {
  switch (format) {
    case "story":
      return {
        width: 1080,
        height: 1920,
        paddingX: 72,
        paddingTop: 96,
        paddingBottom: 168,
        contentInsetEnd: 56,
        badgeWidth: 188,
        badgeLogoHeight: 32,
        badgeOffsetTop: 72,
        verticalLabelWidth: 44,
        verticalLabelHeight: 640,
        verticalLabelFontSize: 28,
        presentedFontSize: 13,
        nameFontSize: 72,
        recognitionFontSize: 12,
        programFontSize: 36,
        hoursFontSize: 13,
        quoteFontSize: 20,
        quoteLineHeight: 1.65,
        footerNameFontSize: 20,
        footerRoleFontSize: 11,
        footerOrgFontSize: 13,
        footerMetaFontSize: 13,
        footerTitleFontSize: 11,
        footerCredentialFontSize: 11,
        footerNumberFontSize: 13,
        signatureHeight: 92,
        signatureMaxWidth: 260,
        logoHeight: 58,
        nameMarginTop: 28,
        programBlockMarginTop: 40,
        programTitleMarginTop: 16,
        hoursMarginTop: 12,
        quoteMarginTop: 20,
        programTitleLineHeight: 1.25,
        footerGap: 44,
        layout: "portrait",
      };
    case "post":
      return {
        width: 1080,
        height: 1350,
        paddingX: 64,
        paddingTop: 64,
        paddingBottom: 88,
        contentInsetEnd: 52,
        badgeWidth: 148,
        badgeLogoHeight: 26,
        badgeOffsetTop: 28,
        verticalLabelWidth: 42,
        verticalLabelHeight: 480,
        verticalLabelFontSize: 24,
        presentedFontSize: 11,
        nameFontSize: 50,
        recognitionFontSize: 10,
        programFontSize: 24,
        hoursFontSize: 11,
        quoteFontSize: 15,
        quoteLineHeight: 1.55,
        footerNameFontSize: 16,
        footerRoleFontSize: 10,
        footerOrgFontSize: 11,
        footerMetaFontSize: 11,
        footerTitleFontSize: 9,
        footerCredentialFontSize: 9,
        footerNumberFontSize: 11,
        signatureHeight: 68,
        signatureMaxWidth: 210,
        logoHeight: 46,
        nameMarginTop: 18,
        programBlockMarginTop: 22,
        programTitleMarginTop: 12,
        hoursMarginTop: 18,
        quoteMarginTop: 8,
        programTitleLineHeight: 1.35,
        footerGap: 32,
        layout: "portrait",
      };
    case "document":
    default:
      return {
        width: 960,
        height: Math.round(960 * (210 / 297)),
        paddingX: 40,
        paddingTop: 28,
        paddingBottom: 28,
        contentInsetEnd: 48,
        badgeWidth: 124,
        badgeLogoHeight: 21,
        badgeOffsetTop: 0,
        verticalLabelWidth: 40,
        verticalLabelHeight: 300,
        verticalLabelFontSize: 24,
        presentedFontSize: 13,
        nameFontSize: 60,
        recognitionFontSize: 12,
        programFontSize: 24,
        hoursFontSize: 13,
        quoteFontSize: 14,
        quoteLineHeight: 1.55,
        footerNameFontSize: 16,
        footerRoleFontSize: 10,
        footerOrgFontSize: 12,
        footerMetaFontSize: 12,
        footerTitleFontSize: 10,
        footerCredentialFontSize: 10,
        footerNumberFontSize: 12,
        signatureHeight: 64,
        signatureMaxWidth: 180,
        logoHeight: 44,
        nameMarginTop: 18,
        programBlockMarginTop: 28,
        programTitleMarginTop: 12,
        hoursMarginTop: 8,
        quoteMarginTop: 16,
        programTitleLineHeight: 1.25,
        footerGap: 40,
        layout: "landscape",
      };
  }
}
