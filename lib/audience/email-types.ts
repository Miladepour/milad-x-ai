import type { AudienceLocale, StudentAudienceFilter } from "@/lib/audience/types";

export type AudienceEmailListType = "subscribers" | "leads" | "waitlist";

export type AudienceEmailCampaignStatus = "sending" | "completed" | "cancelled";

export type AudienceEmailDeliveryStatus = "pending" | "sent" | "failed";

export interface AudienceEmailRecipient {
  email: string;
  fullName: string;
  locale: AudienceLocale;
}

export interface AudienceEmailAudience {
  listType: AudienceEmailListType;
  source?: string;
  country?: string;
  courseSlug?: string;
  studentFilter?: StudentAudienceFilter;
}

export interface AudienceEmailTemplate {
  id: string;
  name: string;
  subject: string;
  bodyHtml: string;
  createdAt: string;
  updatedAt: string;
}

export interface AudienceEmailDelivery {
  id: string;
  campaignId: string;
  recipientEmail: string;
  recipientName: string;
  locale: AudienceLocale;
  resendMessageId: string | null;
  status: AudienceEmailDeliveryStatus;
  statusDetail: string | null;
  createdAt: string;
  sentAt: string | null;
}

export interface AudienceEmailCampaign {
  id: string;
  subject: string;
  bodyHtml: string;
  listType: AudienceEmailListType;
  audienceLabel: string;
  sourceFilter: string | null;
  countryFilter: string | null;
  courseSlug: string | null;
  studentFilter: StudentAudienceFilter;
  status: AudienceEmailCampaignStatus;
  sentBy: string | null;
  recipientCount: number;
  sentCount: number;
  failedCount: number;
  createdAt: string;
  completedAt: string | null;
  deliveries: AudienceEmailDelivery[];
}

export interface AudienceEmailBatchResult {
  campaignId: string;
  sent: number;
  failed: number;
  pending: number;
  total: number;
  sentThisBatch: number;
  status: AudienceEmailCampaignStatus;
}

export const AUDIENCE_EMAIL_BATCH_SIZE = 10;
export const AUDIENCE_EMAIL_BATCH_DELAY_MS = 60_000;
