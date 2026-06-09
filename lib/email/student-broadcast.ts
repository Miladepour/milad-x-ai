import { buildEmailLayout, sendRawEmail } from "@/lib/email/resend";
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
}): string {
  const isFa = options.locale === "FA";
  const name = options.fullName.trim() || (isFa ? "دانشجو" : "there");
  const greeting = isFa ? `سلام ${name}!` : `Hi ${name}!`;
  const safeBody = sanitizeEmailHtml(options.bodyHtml);

  return buildEmailLayout(`
    <h1 style="margin:0 0 20px;font-size:24px;color:#F5F0E8;font-weight:600;">${escapeHtml(greeting)}</h1>
    <div style="font-size:15px;line-height:1.65;color:#F5F0E8CC;">
      ${safeBody}
    </div>
  `);
}

export async function sendStudentBroadcastEmails(options: {
  subject: string;
  bodyHtml: string;
  recipients: StudentEmailRecipient[];
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
    });
    const ok = await sendRawEmail({
      to: recipient.email,
      subject,
      html,
    });
    if (ok) sent += 1;
    else failed += 1;
  }

  return { sent, failed };
}
