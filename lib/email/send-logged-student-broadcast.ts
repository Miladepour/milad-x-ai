import { renderStudentBroadcastEmail } from "@/lib/email/student-broadcast";
import { sendRawEmail } from "@/lib/email/resend";
import { sanitizeEmailHtml } from "@/lib/email/sanitize-html";
import {
  createStudentEmailCampaign,
  finalizeStudentEmailCampaignCounts,
  recordStudentEmailDelivery,
} from "@/lib/members/student-email-store";
import type { StudentEmailAudienceType, StudentProfile } from "@/lib/members/types";

export async function sendLoggedStudentBroadcastEmails(options: {
  subject: string;
  bodyHtml: string;
  recipients: StudentProfile[];
  audienceType: StudentEmailAudienceType;
  audienceLabel: string;
  programId?: string | null;
  studentId?: string | null;
  sentBy: string;
}): Promise<{ sent: number; failed: number; campaignId: string }> {
  const subject = options.subject.trim();
  const bodyHtml = sanitizeEmailHtml(options.bodyHtml);

  const campaignId = await createStudentEmailCampaign({
    subject,
    bodyHtml,
    audienceType: options.audienceType,
    audienceLabel: options.audienceLabel,
    programId: options.programId,
    studentId: options.studentId,
    sentBy: options.sentBy,
    recipientCount: options.recipients.length,
  });

  let sent = 0;
  let failed = 0;

  for (const student of options.recipients) {
    const html = renderStudentBroadcastEmail({
      bodyHtml,
      fullName: student.fullName,
      locale: student.locale === "FA" ? "FA" : "EN",
    });

    const result = await sendRawEmail({
      to: student.email,
      subject,
      html,
    });

    await recordStudentEmailDelivery({
      campaignId,
      student,
      status: result.ok ? "sent" : "failed",
      resendMessageId: result.messageId ?? null,
      statusDetail: result.error ?? null,
    });

    if (result.ok) sent += 1;
    else failed += 1;
  }

  await finalizeStudentEmailCampaignCounts(campaignId, sent, failed);

  return { sent, failed, campaignId };
}
