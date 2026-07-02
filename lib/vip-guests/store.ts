import { randomBytes } from "crypto";
import type {
  CreateVipGuestInvitePayload,
  VipGuestInvite,
  VipGuestInviteRow,
} from "@/lib/vip-guests/types";
import { createServiceClient } from "@/lib/supabase/server";

function generateToken(): string {
  return randomBytes(24).toString("base64url");
}

function resolveProgramSlug(
  row: VipGuestInviteRow
): string | null {
  const rel = row.member_programs;
  if (!rel) return null;
  if (Array.isArray(rel)) return rel[0]?.slug ?? null;
  return rel.slug ?? null;
}

function rowToInvite(row: VipGuestInviteRow): VipGuestInvite {
  return {
    id: row.id,
    token: row.token,
    fullName: row.full_name,
    email: row.email,
    guestTitle: row.guest_title,
    eventDate: row.event_date,
    eventTitle: row.event_title,
    programId: row.program_id,
    programSlug: resolveProgramSlug(row),
    locale: row.locale,
    invitedBy: row.invited_by,
    emailSentAt: row.email_sent_at,
    openedAt: row.opened_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const INVITE_SELECT = `
  id,
  token,
  full_name,
  email,
  guest_title,
  event_date,
  event_title,
  program_id,
  locale,
  invited_by,
  email_sent_at,
  opened_at,
  created_at,
  updated_at,
  member_programs ( slug )
`;

export async function listVipGuestInvitesAdmin(): Promise<VipGuestInvite[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("vip_guest_invites")
    .select(INVITE_SELECT)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return ((data ?? []) as VipGuestInviteRow[]).map(rowToInvite);
}

export async function getVipGuestInviteByToken(
  token: string
): Promise<VipGuestInvite | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("vip_guest_invites")
    .select(INVITE_SELECT)
    .eq("token", token.trim())
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return rowToInvite(data as VipGuestInviteRow);
}

export async function markVipGuestInviteOpened(token: string): Promise<void> {
  const supabase = createServiceClient();
  const { data: existing } = await supabase
    .from("vip_guest_invites")
    .select("id, opened_at")
    .eq("token", token.trim())
    .maybeSingle();

  if (!existing || existing.opened_at) return;

  const { error } = await supabase
    .from("vip_guest_invites")
    .update({ opened_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", existing.id);

  if (error) throw new Error(error.message);
}

export async function createVipGuestInviteAdmin(
  payload: CreateVipGuestInvitePayload,
  invitedBy: string
): Promise<VipGuestInvite> {
  const supabase = createServiceClient();
  const token = generateToken();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("vip_guest_invites")
    .insert({
      token,
      full_name: payload.fullName.trim(),
      email: payload.email?.trim().toLowerCase() || null,
      guest_title: (payload.guestTitle ?? "VIP Guest").trim() || "VIP Guest",
      event_date: payload.eventDate,
      event_title: payload.eventTitle.trim(),
      program_id: payload.programId ?? null,
      locale: payload.locale ?? "EN",
      invited_by: invitedBy,
      updated_at: now,
    })
    .select(INVITE_SELECT)
    .single();

  if (error) throw new Error(error.message);
  return rowToInvite(data as VipGuestInviteRow);
}

export async function markVipGuestInviteEmailSent(id: string): Promise<void> {
  const supabase = createServiceClient();
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("vip_guest_invites")
    .update({ email_sent_at: now, updated_at: now })
    .eq("id", id);

  if (error) throw new Error(error.message);
}

export async function deleteVipGuestInviteAdmin(id: string): Promise<void> {
  const supabase = createServiceClient();
  const { error } = await supabase.from("vip_guest_invites").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function resendVipGuestInviteAdmin(id: string): Promise<VipGuestInvite | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("vip_guest_invites")
    .select(INVITE_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return rowToInvite(data as VipGuestInviteRow);
}
