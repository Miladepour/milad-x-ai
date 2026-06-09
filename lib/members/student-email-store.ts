import { createClient, createServiceClient } from "@/lib/supabase/server";
import type {
  StudentEmailAudienceType,
  StudentEmailCampaign,
  StudentEmailDelivery,
  StudentEmailDeliveryStatus,
  StudentProfile,
} from "@/lib/members/types";

const EMAIL_HISTORY_SETUP_HINT =
  "Run supabase/patch-student-email-history.sql in the Supabase SQL editor.";

interface StudentEmailCampaignRow {
  id: string;
  subject: string;
  body_html: string;
  audience_type: StudentEmailAudienceType;
  audience_label: string;
  program_id: string | null;
  student_id: string | null;
  sent_by: string | null;
  recipient_count: number;
  sent_count: number;
  failed_count: number;
  created_at: string;
}

interface StudentEmailDeliveryRow {
  id: string;
  campaign_id: string;
  student_id: string | null;
  recipient_email: string;
  recipient_name: string;
  locale: "EN" | "FA";
  resend_message_id: string | null;
  status: StudentEmailDeliveryStatus;
  status_detail: string | null;
  sent_at: string;
  delivered_at: string | null;
  opened_at: string | null;
  updated_at: string;
}

function isMissingEmailHistoryTable(error: { message?: string; code?: string }): boolean {
  const msg = error.message ?? "";
  return (
    error.code === "PGRST205" ||
    ((msg.includes("student_email_campaigns") || msg.includes("student_email_deliveries")) &&
      (msg.includes("schema cache") || msg.includes("does not exist")))
  );
}

function deliveryRowToDelivery(row: StudentEmailDeliveryRow): StudentEmailDelivery {
  return {
    id: row.id,
    campaignId: row.campaign_id,
    studentId: row.student_id,
    recipientEmail: row.recipient_email,
    recipientName: row.recipient_name,
    locale: row.locale,
    resendMessageId: row.resend_message_id,
    status: row.status,
    statusDetail: row.status_detail,
    sentAt: row.sent_at,
    deliveredAt: row.delivered_at,
    openedAt: row.opened_at,
    updatedAt: row.updated_at,
  };
}

function campaignRowToCampaign(
  row: StudentEmailCampaignRow,
  deliveries: StudentEmailDelivery[]
): StudentEmailCampaign {
  return {
    id: row.id,
    subject: row.subject,
    bodyHtml: row.body_html,
    audienceType: row.audience_type,
    audienceLabel: row.audience_label,
    programId: row.program_id,
    studentId: row.student_id,
    sentBy: row.sent_by,
    recipientCount: row.recipient_count,
    sentCount: row.sent_count,
    failedCount: row.failed_count,
    createdAt: row.created_at,
    deliveries,
  };
}

export async function createStudentEmailCampaign(options: {
  subject: string;
  bodyHtml: string;
  audienceType: StudentEmailAudienceType;
  audienceLabel: string;
  programId?: string | null;
  studentId?: string | null;
  sentBy: string;
  recipientCount: number;
}): Promise<string> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("student_email_campaigns")
    .insert({
      subject: options.subject,
      body_html: options.bodyHtml,
      audience_type: options.audienceType,
      audience_label: options.audienceLabel,
      program_id: options.programId ?? null,
      student_id: options.studentId ?? null,
      sent_by: options.sentBy,
      recipient_count: options.recipientCount,
      sent_count: 0,
      failed_count: 0,
    })
    .select("id")
    .single();

  if (error) {
    if (isMissingEmailHistoryTable(error)) throw new Error(EMAIL_HISTORY_SETUP_HINT);
    throw new Error(error.message);
  }

  return (data as { id: string }).id;
}

export async function recordStudentEmailDelivery(options: {
  campaignId: string;
  student: StudentProfile;
  status: StudentEmailDeliveryStatus;
  resendMessageId?: string | null;
  statusDetail?: string | null;
}): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("student_email_deliveries").insert({
    campaign_id: options.campaignId,
    student_id: options.student.id,
    recipient_email: options.student.email,
    recipient_name: options.student.fullName,
    locale: options.student.locale,
    resend_message_id: options.resendMessageId ?? null,
    status: options.status,
    status_detail: options.statusDetail ?? null,
    delivered_at: options.status === "delivered" ? new Date().toISOString() : null,
  });

  if (error) {
    if (isMissingEmailHistoryTable(error)) throw new Error(EMAIL_HISTORY_SETUP_HINT);
    throw new Error(error.message);
  }
}

export async function finalizeStudentEmailCampaignCounts(
  campaignId: string,
  sentCount: number,
  failedCount: number
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("student_email_campaigns")
    .update({ sent_count: sentCount, failed_count: failedCount })
    .eq("id", campaignId);

  if (error) {
    if (isMissingEmailHistoryTable(error)) throw new Error(EMAIL_HISTORY_SETUP_HINT);
    throw new Error(error.message);
  }
}

export async function listStudentEmailHistoryAdmin(): Promise<StudentEmailCampaign[]> {
  const supabase = createClient();
  const { data: campaigns, error } = await supabase
    .from("student_email_campaigns")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    if (isMissingEmailHistoryTable(error)) return [];
    throw new Error(error.message);
  }

  const rows = (campaigns ?? []) as StudentEmailCampaignRow[];
  if (rows.length === 0) return [];

  const campaignIds = rows.map((row) => row.id);
  const { data: deliveries, error: deliveryError } = await supabase
    .from("student_email_deliveries")
    .select("*")
    .in("campaign_id", campaignIds)
    .order("sent_at", { ascending: true });

  if (deliveryError) {
    if (isMissingEmailHistoryTable(deliveryError)) return [];
    throw new Error(deliveryError.message);
  }

  const deliveryRows = (deliveries ?? []) as StudentEmailDeliveryRow[];
  const byCampaign = new Map<string, StudentEmailDelivery[]>();
  for (const row of deliveryRows) {
    const list = byCampaign.get(row.campaign_id) ?? [];
    list.push(deliveryRowToDelivery(row));
    byCampaign.set(row.campaign_id, list);
  }

  return rows.map((row) => campaignRowToCampaign(row, byCampaign.get(row.id) ?? []));
}

export async function updateStudentEmailDeliveryFromWebhook(options: {
  resendMessageId: string;
  status: StudentEmailDeliveryStatus;
  statusDetail?: string | null;
  eventAt?: string | null;
}): Promise<boolean> {
  const supabase = createServiceClient();
  const eventAt = options.eventAt ?? new Date().toISOString();
  const terminal = new Set<StudentEmailDeliveryStatus>(["bounced", "complained", "failed"]);

  const { data: existing, error: fetchError } = await supabase
    .from("student_email_deliveries")
    .select("id, status, opened_at, delivered_at")
    .eq("resend_message_id", options.resendMessageId)
    .maybeSingle();

  if (fetchError) {
    if (isMissingEmailHistoryTable(fetchError)) return false;
    throw new Error(fetchError.message);
  }
  if (!existing) return false;

  const currentStatus = existing.status as StudentEmailDeliveryStatus;
  const patch: Record<string, unknown> = { updated_at: eventAt };

  if (options.status === "opened") {
    if (terminal.has(currentStatus)) return false;
    if (existing.opened_at) return true;
    patch.status = "opened";
    patch.opened_at = eventAt;
  } else if (options.status === "delivered") {
    if (terminal.has(currentStatus)) return false;
    patch.delivered_at = existing.delivered_at ?? eventAt;
    if (currentStatus !== "opened") {
      patch.status = "delivered";
    }
  } else if (terminal.has(options.status)) {
    patch.status = options.status;
    patch.status_detail = options.statusDetail ?? null;
  } else if (options.status === "delayed") {
    if (currentStatus === "sent") {
      patch.status = "delayed";
      patch.status_detail = options.statusDetail ?? null;
    } else {
      return true;
    }
  } else if (options.status === "sent") {
    if (currentStatus === "failed") {
      patch.status = "sent";
      patch.status_detail = null;
    } else {
      return true;
    }
  }

  const { data, error } = await supabase
    .from("student_email_deliveries")
    .update(patch)
    .eq("resend_message_id", options.resendMessageId)
    .select("id")
    .maybeSingle();

  if (error) {
    if (isMissingEmailHistoryTable(error)) return false;
    throw new Error(error.message);
  }

  return Boolean(data);
}

export function mapResendEventType(eventType: string): StudentEmailDeliveryStatus | null {
  switch (eventType) {
    case "email.sent":
      return "sent";
    case "email.delivered":
      return "delivered";
    case "email.opened":
      return "opened";
    case "email.bounced":
      return "bounced";
    case "email.complained":
      return "complained";
    case "email.delivery_delayed":
      return "delayed";
    default:
      return null;
  }
}
