import type { EmailBannerId } from "@/lib/email/banners";
import { DEFAULT_BROADCAST_BANNER_ID } from "@/lib/email/banners";
import { sendRawEmail } from "@/lib/email/resend";
import { buildEmailLayout } from "@/lib/email/template";
import { sanitizeEmailHtml } from "@/lib/email/sanitize-html";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export interface StudentEmailRecipient {
  email: string;
  fullName: string;
  locale: "EN" | "FA";
}

export function renderStudentBroadcastEmail(options: {
  bodyHtml: string;
  fullName: string;
  locale: "EN" | "FA";
  bannerId?: EmailBannerId;
}): string {
  const isFa = options.locale === "FA";
  const name = options.fullName.trim() || (isFa ? "دانشجو" : "there");
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

export async function sendStudentBroadcastEmails(options: {
  subject: string;
  bodyHtml: string;
  recipients: StudentEmailRecipient[];
  bannerId?: EmailBannerId;
}): Promise<{ sent: number; failed: number }> {
  const subject = options.subject.trim();
  const bodyHtml = sanitizeEmailHtml(options.bodyHtml);
  let sent = 0;
  let failed = 0;

  for (const recipient of options.recipients) {
    const html = renderStudentBroadcastEmail({
      bodyHtml,
      fullName: recipient.fullName,
      locale: recipient.locale,
      bannerId: options.bannerId,
    });
    const result = await sendRawEmail({
      to: recipient.email,
      subject,
      html,
    });
    if (result.ok) sent += 1;
    else failed += 1;
  }

  return { sent, failed };
}
