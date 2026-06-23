import { DEFAULT_BROADCAST_BANNER_ID, type EmailBannerId } from "@/lib/email/banners";
import { buildEmailLayout } from "@/lib/email/template";
import { sanitizeEmailHtml } from "@/lib/email/sanitize-html";
import type { AudienceEmailRecipient } from "@/lib/audience/email-types";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderAudienceBroadcastEmail(options: {
  bodyHtml: string;
  fullName: string;
  locale: "EN" | "FA";
  bannerId?: EmailBannerId;
}): string {
  const isFa = options.locale === "FA";
  const name = options.fullName.trim() || (isFa ? "دوست عزیز" : "there");
  const greeting = isFa ? `سلام ${name}!` : `Hi ${name}!`;
  const safeBody = sanitizeEmailHtml(options.bodyHtml);
  const bannerId = options.bannerId ?? DEFAULT_BROADCAST_BANNER_ID;

  return buildEmailLayout(
    `
    <h1 style="margin:0 0 20px;font-size:26px;line-height:1.3;color:#1A1A1A;font-weight:700;">${escapeHtml(greeting)}</h1>
    <div style="font-size:16px;line-height:1.7;color:#4A4A4A;">
      ${safeBody}
    </div>
  `,
    { bannerId, locale: options.locale }
  );
}

export function previewAudienceBroadcastEmail(options: {
  bodyHtml: string;
  recipient: AudienceEmailRecipient;
  bannerId?: EmailBannerId;
}): string {
  return renderAudienceBroadcastEmail({
    bodyHtml: options.bodyHtml,
    fullName: options.recipient.fullName,
    locale: options.recipient.locale,
    bannerId: options.bannerId,
  });
}
