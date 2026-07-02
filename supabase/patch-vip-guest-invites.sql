-- VIP guest invites: tokenized public badge landing pages
-- Run in Supabase Dashboard → SQL → New query

create table if not exists public.vip_guest_invites (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,
  full_name text not null,
  email text not null,
  guest_title text not null default 'VIP Guest',
  event_date date not null,
  event_title text not null,
  program_id uuid references public.member_programs (id) on delete set null,
  locale text not null default 'EN' check (locale in ('EN', 'FA')),
  invited_by uuid references auth.users (id) on delete set null,
  email_sent_at timestamptz,
  opened_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists vip_guest_invites_token_idx
  on public.vip_guest_invites (token);

create index if not exists vip_guest_invites_email_idx
  on public.vip_guest_invites (email, created_at desc);

create index if not exists vip_guest_invites_event_date_idx
  on public.vip_guest_invites (event_date desc);

alter table public.vip_guest_invites enable row level security;

drop policy if exists "Admins all vip_guest_invites" on public.vip_guest_invites;
create policy "Admins all vip_guest_invites"
  on public.vip_guest_invites for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

grant all on public.vip_guest_invites to authenticated;
