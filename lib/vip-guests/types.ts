import type { LocaleCode } from "@/lib/supabase/database.types";

export interface VipGuestInvite {
  id: string;
  token: string;
  fullName: string;
  email: string | null;
  guestTitle: string;
  eventDate: string;
  eventTitle: string;
  programId: string | null;
  programSlug: string | null;
  locale: LocaleCode;
  invitedBy: string | null;
  emailSentAt: string | null;
  openedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVipGuestInvitePayload {
  fullName: string;
  email?: string | null;
  guestTitle?: string;
  eventDate: string;
  eventTitle: string;
  programId?: string | null;
  locale?: LocaleCode;
  sendEmail?: boolean;
}

export interface VipGuestInviteRow {
  id: string;
  token: string;
  full_name: string;
  email: string | null;
  guest_title: string;
  event_date: string;
  event_title: string;
  program_id: string | null;
  locale: LocaleCode;
  invited_by: string | null;
  email_sent_at: string | null;
  opened_at: string | null;
  created_at: string;
  updated_at: string;
  member_programs?: { slug: string } | { slug: string }[] | null;
}
