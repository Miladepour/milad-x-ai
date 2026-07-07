import { getEmailBannerImageUrl, type EmailBannerId } from "@/lib/email/banners";
import { SITE_URL } from "@/lib/i18n/config";

export const EMAIL_ORANGE = "#FF5C00";
export const EMAIL_TEXT = "#1A1A1A";
export const EMAIL_TEXT_MUTED = "#4A4A4A";
export const EMAIL_BG = "#F4F4F4";

const FOOTER_TAGLINE =
  "Learn content creation, image generation, video production, and automation with AI — through free tutorials, live workshops, and private courses.";

const SOCIAL_LINKS = [
  { label: "Website", href: SITE_URL },
  { label: "Instagram", href: "https://www.instagram.com/miladxaitalks/" },
  { label: "YouTube", href: "https://www.youtube.com/@miladxtalks" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/milad-epour/" },
] as const;

function absoluteAsset(path: string): string {
  const base = SITE_URL.replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export interface EmailLayoutOptions {
  bannerId: EmailBannerId;
  locale?: "EN" | "FA";
}

export interface TransactionalEmailLayoutOptions {
  locale?: "EN" | "FA";
}

function footerLinksHtml(): string {
  return SOCIAL_LINKS.map(
    (link) =>
      `<a href="${link.href}" style="color:${EMAIL_ORANGE};text-decoration:none;font-weight:600;">${link.label}</a>`
  ).join(`<span style="color:#CCC;">&nbsp;·&nbsp;</span>`);
}

export function emailPrimaryButton(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background:${EMAIL_ORANGE};color:#FFFFFF;text-decoration:none;padding:14px 28px;font-size:14px;font-weight:700;border-radius:4px;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">${label}</a>`;
}

export function emailSecondaryButton(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;border:2px solid ${EMAIL_ORANGE};color:${EMAIL_ORANGE};text-decoration:none;padding:12px 24px;font-size:14px;font-weight:700;border-radius:4px;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">${label}</a>`;
}

export function buildEmailLayout(content: string, options: EmailLayoutOptions): string {
  const isFa = options.locale === "FA";
  const dir = isFa ? "rtl" : "ltr";
  const lang = isFa ? "fa" : "en";
  const logoStripUrl = absoluteAsset("/images/email-banner-with-logo.gif");
  const bannerUrl = getEmailBannerImageUrl(options.bannerId);
  const align = isFa ? "right" : "left";

  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <title>MX AI Academy</title>
</head>
<body style="margin:0;padding:0;background:${EMAIL_BG};font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:${EMAIL_BG};padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;background:#FFFFFF;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
          <tr>
            <td style="background:${EMAIL_ORANGE};padding:0;line-height:0;font-size:0;">
              <img
                src="${bannerUrl}"
                alt=""
                width="600"
                style="display:block;width:100%;max-width:600px;height:auto;border:0;"
              />
            </td>
          </tr>
          <tr>
            <td style="padding:0;line-height:0;font-size:0;">
              <a href="${SITE_URL}" style="text-decoration:none;display:block;">
                <img
                  src="${logoStripUrl}"
                  alt="MX AI Academy"
                  width="600"
                  style="display:block;width:100%;max-width:600px;height:auto;border:0;"
                />
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px;color:${EMAIL_TEXT};font-size:16px;line-height:1.65;" align="${align}">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border-top:1px solid #E8E8E8;">
                <tr>
                  <td style="padding-top:24px;font-size:13px;line-height:1.7;color:${EMAIL_TEXT_MUTED};" align="center">
                    <p style="margin:0 0 16px;">${FOOTER_TAGLINE}</p>
                    <p style="margin:0 0 12px;font-size:13px;line-height:1.8;">
                      ${footerLinksHtml()}
                    </p>
                    <p style="margin:0;font-size:12px;color:#999;">© ${new Date().getFullYear()} MX AI Academy</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Minimal layout for account emails (invite, password reset) — fewer promotional signals for inbox placement. */
export function buildTransactionalEmailLayout(
  content: string,
  options: TransactionalEmailLayoutOptions = {}
): string {
  const isFa = options.locale === "FA";
  const dir = isFa ? "rtl" : "ltr";
  const lang = isFa ? "fa" : "en";
  const align = isFa ? "right" : "left";
  const supportLine = isFa
    ? "اگر کمکی نیاز دارید: contact@mxaiacademy.com"
    : "Need help? contact@mxaiacademy.com";

  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <title>MX AI Academy</title>
</head>
<body style="margin:0;padding:0;background:${EMAIL_BG};font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:${EMAIL_BG};padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;background:#FFFFFF;border-radius:8px;overflow:hidden;border:1px solid #E8E8E8;">
          <tr>
            <td style="padding:24px 28px 8px;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
              <p style="margin:0;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${EMAIL_ORANGE};">
                MX AI Academy
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 28px 28px;color:${EMAIL_TEXT};font-size:16px;line-height:1.65;" align="${align}">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 24px;font-size:12px;line-height:1.6;color:#999;" align="center">
              <p style="margin:0 0 8px;">${supportLine}</p>
              <p style="margin:0;">© ${new Date().getFullYear()} MX AI Academy</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
