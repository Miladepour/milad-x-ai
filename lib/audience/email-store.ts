import {
  AUDIENCE_EMAIL_BATCH_SIZE,
  type AudienceEmailAudience,
  type AudienceEmailBatchResult,
  type AudienceEmailCampaign,
  type AudienceEmailCampaignStatus,
  type AudienceEmailDelivery,
  type AudienceEmailDeliveryStatus,
  type AudienceEmailRecipient,
  type AudienceEmailTemplate,
} from "@/lib/audience/email-types";
import { renderAudienceBroadcastEmail } from "@/lib/email/audience-broadcast";
import { sendRawEmail } from "@/lib/email/resend";
import { sanitizeEmailHtml } from "@/lib/email/sanitize-html";
import { buildAudienceEmailLabel } from "@/lib/audience/recipients";
import { createAdminDbClient } from "@/lib/supabase/admin-client";

const EMAIL_SETUP_HINT = "Run supabase/patch-audience-email.sql in the Supabase SQL editor.";

interface TemplateRow {
  id: string;
  name: string;
  subject: string;
  body_html: string;
  created_at: string;
  updated_at: string;
}

interface CampaignRow {
  id: string;
  subject: string;
  body_html: string;
  list_type: AudienceEmailCampaign["listType"];
  audience_label: string;
  source_filter: string | null;
  course_slug: string | null;
  student_filter: AudienceEmailCampaign["studentFilter"];
  status: AudienceEmailCampaignStatus;
  sent_by: string | null;
  recipient_count: number;
  sent_count: number;
  failed_count: number;
  created_at: string;
  completed_at: string | null;
}

interface DeliveryRow {
  id: string;
  campaign_id: string;
  recipient_email: string;
  recipient_name: string;
  locale: "EN" | "FA";
  resend_message_id: string | null;
  status: AudienceEmailDeliveryStatus;
  status_detail: string | null;
  created_at: string;
  sent_at: string | null;
}

function isMissingEmailTable(error: { message?: string; code?: string }): boolean {
  const msg = error.message ?? "";
  return (
    error.code === "PGRST205" ||
    ((msg.includes("audience_email_campaigns") ||
      msg.includes("audience_email_deliveries") ||
      msg.includes("audience_email_templates")) &&
      (msg.includes("schema cache") || msg.includes("does not exist")))
  );
}

function templateRowToTemplate(row: TemplateRow): AudienceEmailTemplate {
  return {
    id: row.id,
    name: row.name,
    subject: row.subject,
    bodyHtml: row.body_html,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function deliveryRowToDelivery(row: DeliveryRow): AudienceEmailDelivery {
  return {
    id: row.id,
    campaignId: row.campaign_id,
    recipientEmail: row.recipient_email,
    recipientName: row.recipient_name,
    locale: row.locale,
    resendMessageId: row.resend_message_id,
    status: row.status,
    statusDetail: row.status_detail,
    createdAt: row.created_at,
    sentAt: row.sent_at,
  };
}

function campaignRowToCampaign(
  row: CampaignRow,
  deliveries: AudienceEmailDelivery[]
): AudienceEmailCampaign {
  return {
    id: row.id,
    subject: row.subject,
    bodyHtml: row.body_html,
    listType: row.list_type,
    audienceLabel: row.audience_label,
    sourceFilter: row.source_filter,
    courseSlug: row.course_slug,
    studentFilter: row.student_filter,
    status: row.status,
    sentBy: row.sent_by,
    recipientCount: row.recipient_count,
    sentCount: row.sent_count,
    failedCount: row.failed_count,
    createdAt: row.created_at,
    completedAt: row.completed_at,
    deliveries,
  };
}

export async function listAudienceEmailTemplatesAdmin(): Promise<AudienceEmailTemplate[]> {
  const supabase = createAdminDbClient();
  const { data, error } = await supabase
    .from("audience_email_templates")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    if (isMissingEmailTable(error)) throw new Error(EMAIL_SETUP_HINT);
    throw new Error(error.message);
  }

  return (data as TemplateRow[]).map(templateRowToTemplate);
}

export async function saveAudienceEmailTemplateAdmin(options: {
  id?: string | null;
  name: string;
  subject: string;
  bodyHtml: string;
}): Promise<AudienceEmailTemplate> {
  const name = options.name.trim();
  const subject = options.subject.trim();
  const bodyHtml = sanitizeEmailHtml(options.bodyHtml);

  if (!name) throw new Error("Template name is required");
  if (!subject) throw new Error("Subject is required");
  if (!bodyHtml || bodyHtml === "<p></p>") throw new Error("Email body is required");

  const supabase = createAdminDbClient();
  const payload = {
    name,
    subject,
    body_html: bodyHtml,
    updated_at: new Date().toISOString(),
  };

  if (options.id) {
    const { data, error } = await supabase
      .from("audience_email_templates")
      .update(payload)
      .eq("id", options.id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return templateRowToTemplate(data as TemplateRow);
  }

  const { data, error } = await supabase
    .from("audience_email_templates")
    .insert(payload)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return templateRowToTemplate(data as TemplateRow);
}

export async function deleteAudienceEmailTemplateAdmin(templateId: string): Promise<void> {
  const supabase = createAdminDbClient();
  const { error } = await supabase.from("audience_email_templates").delete().eq("id", templateId);
  if (error) throw new Error(error.message);
}

export async function createAudienceEmailCampaignAdmin(options: {
  subject: string;
  bodyHtml: string;
  audience: AudienceEmailAudience;
  recipients: AudienceEmailRecipient[];
  sentBy: string;
}): Promise<string> {
  const subject = options.subject.trim();
  const bodyHtml = sanitizeEmailHtml(options.bodyHtml);
  const audienceLabel = buildAudienceEmailLabel(options.audience);

  const supabase = createAdminDbClient();
  const { data: campaignData, error: campaignError } = await supabase
    .from("audience_email_campaigns")
    .insert({
      subject,
      body_html: bodyHtml,
      list_type: options.audience.listType,
      audience_label: audienceLabel,
      source_filter: options.audience.source?.trim() || null,
      course_slug: options.audience.courseSlug?.trim() || null,
      student_filter: options.audience.studentFilter ?? "non-students",
      status: "sending",
      sent_by: options.sentBy,
      recipient_count: options.recipients.length,
      sent_count: 0,
      failed_count: 0,
    })
    .select("id")
    .single();

  if (campaignError) {
    if (isMissingEmailTable(campaignError)) throw new Error(EMAIL_SETUP_HINT);
    throw new Error(campaignError.message);
  }

  const campaignId = campaignData.id as string;
  if (options.recipients.length === 0) {
    await supabase
      .from("audience_email_campaigns")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("id", campaignId);
    return campaignId;
  }

  const deliveryRows = options.recipients.map((recipient) => ({
    campaign_id: campaignId,
    recipient_email: recipient.email,
    recipient_name: recipient.fullName,
    locale: recipient.locale,
    status: "pending" as const,
  }));

  const { error: deliveryError } = await supabase
    .from("audience_email_deliveries")
    .insert(deliveryRows);

  if (deliveryError) throw new Error(deliveryError.message);
  return campaignId;
}

async function refreshCampaignCounts(
  supabase: ReturnType<typeof createAdminDbClient>,
  campaignId: string
): Promise<CampaignRow> {
  const { data: deliveries, error: deliveryError } = await supabase
    .from("audience_email_deliveries")
    .select("status")
    .eq("campaign_id", campaignId);

  if (deliveryError) throw new Error(deliveryError.message);

  const rows = deliveries ?? [];
  const sentCount = rows.filter((row) => row.status === "sent").length;
  const failedCount = rows.filter((row) => row.status === "failed").length;
  const pendingCount = rows.filter((row) => row.status === "pending").length;
  const status: AudienceEmailCampaignStatus =
    pendingCount === 0 ? "completed" : "sending";

  const { data, error } = await supabase
    .from("audience_email_campaigns")
    .update({
      sent_count: sentCount,
      failed_count: failedCount,
      status,
      completed_at: pendingCount === 0 ? new Date().toISOString() : null,
    })
    .eq("id", campaignId)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data as CampaignRow;
}

export async function sendAudienceEmailBatchAdmin(
  campaignId: string,
  batchSize = AUDIENCE_EMAIL_BATCH_SIZE
): Promise<AudienceEmailBatchResult> {
  const supabase = createAdminDbClient();

  const { data: campaignData, error: campaignError } = await supabase
    .from("audience_email_campaigns")
    .select("*")
    .eq("id", campaignId)
    .single();

  if (campaignError) throw new Error(campaignError.message);
  const campaign = campaignData as CampaignRow;

  if (campaign.status === "cancelled") {
    throw new Error("This campaign was cancelled");
  }

  const { data: pendingRows, error: pendingError } = await supabase
    .from("audience_email_deliveries")
    .select("*")
    .eq("campaign_id", campaignId)
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(batchSize);

  if (pendingError) throw new Error(pendingError.message);

  let sentThisBatch = 0;

  for (const row of (pendingRows ?? []) as DeliveryRow[]) {
    const html = renderAudienceBroadcastEmail({
      bodyHtml: campaign.body_html,
      fullName: row.recipient_name,
      locale: row.locale,
    });

    const result = await sendRawEmail({
      to: row.recipient_email,
      subject: campaign.subject,
      html,
    });

    const { error: updateError } = await supabase
      .from("audience_email_deliveries")
      .update({
        status: result.ok ? "sent" : "failed",
        resend_message_id: result.messageId ?? null,
        status_detail: result.error ?? null,
        sent_at: new Date().toISOString(),
      })
      .eq("id", row.id);

    if (updateError) throw new Error(updateError.message);
    if (result.ok) sentThisBatch += 1;
  }

  const updatedCampaign = await refreshCampaignCounts(supabase, campaignId);

  const { count: pendingCount, error: countError } = await supabase
    .from("audience_email_deliveries")
    .select("*", { count: "exact", head: true })
    .eq("campaign_id", campaignId)
    .eq("status", "pending");

  if (countError) throw new Error(countError.message);

  return {
    campaignId,
    sent: updatedCampaign.sent_count,
    failed: updatedCampaign.failed_count,
    pending: pendingCount ?? 0,
    total: updatedCampaign.recipient_count,
    sentThisBatch,
    status: updatedCampaign.status,
  };
}

export async function listAudienceEmailHistoryAdmin(): Promise<AudienceEmailCampaign[]> {
  const supabase = createAdminDbClient();
  const { data: campaigns, error: campaignError } = await supabase
    .from("audience_email_campaigns")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(40);

  if (campaignError) {
    if (isMissingEmailTable(campaignError)) throw new Error(EMAIL_SETUP_HINT);
    throw new Error(campaignError.message);
  }

  const campaignRows = (campaigns ?? []) as CampaignRow[];
  if (campaignRows.length === 0) return [];

  const campaignIds = campaignRows.map((row) => row.id);
  const { data: deliveries, error: deliveryError } = await supabase
    .from("audience_email_deliveries")
    .select("*")
    .in("campaign_id", campaignIds)
    .order("created_at", { ascending: true });

  if (deliveryError) throw new Error(deliveryError.message);

  const deliveriesByCampaign = new Map<string, AudienceEmailDelivery[]>();
  for (const row of (deliveries ?? []) as DeliveryRow[]) {
    const list = deliveriesByCampaign.get(row.campaign_id) ?? [];
    list.push(deliveryRowToDelivery(row));
    deliveriesByCampaign.set(row.campaign_id, list);
  }

  return campaignRows.map((row) =>
    campaignRowToCampaign(row, deliveriesByCampaign.get(row.id) ?? [])
  );
}
