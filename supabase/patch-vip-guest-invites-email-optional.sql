-- Allow VIP guest invites without email (share link manually)
-- Run in Supabase Dashboard → SQL → New query

alter table public.vip_guest_invites
  alter column email drop not null;
