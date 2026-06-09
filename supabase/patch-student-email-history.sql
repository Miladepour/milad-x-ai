-- Student broadcast email history + delivery status
-- Run in Supabase Dashboard → SQL
--
-- After deploy, configure Resend webhook → /api/webhooks/resend
-- Subscribe to: email.sent, email.delivered, email.opened, email.bounced,
-- email.complained, email.delivery_delayed
-- Enable open tracking on your sending domain in Resend → Domains → Configuration
-- Set RESEND_WEBHOOK_SECRET (whsec_…) in Vercel env vars.

create table if not exists public.student_email_campaigns (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  body_html text not null default '',
  audience_type text not null check (audience_type in ('all', 'student', 'program')),
  audience_label text not null default '',
  program_id uuid references public.member_programs (id) on delete set null,
  student_id uuid references public.student_profiles (id) on delete set null,
  sent_by uuid references auth.users (id) on delete set null,
  recipient_count int not null default 0,
  sent_count int not null default 0,
  failed_count int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.student_email_deliveries (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.student_email_campaigns (id) on delete cascade,
  student_id uuid references public.student_profiles (id) on delete set null,
  recipient_email text not null,
  recipient_name text not null default '',
  locale text not null default 'EN' check (locale in ('EN', 'FA')),
  resend_message_id text,
  status text not null default 'sent'
    check (status in ('sent', 'delivered', 'opened', 'bounced', 'complained', 'failed', 'delayed')),
  status_detail text,
  sent_at timestamptz not null default now(),
  delivered_at timestamptz,
  opened_at timestamptz,
  updated_at timestamptz not null default now()
);

create index if not exists student_email_campaigns_created_idx
  on public.student_email_campaigns (created_at desc);

create index if not exists student_email_deliveries_campaign_idx
  on public.student_email_deliveries (campaign_id);

create unique index if not exists student_email_deliveries_resend_message_idx
  on public.student_email_deliveries (resend_message_id)
  where resend_message_id is not null;

alter table public.student_email_campaigns enable row level security;
alter table public.student_email_deliveries enable row level security;

drop policy if exists "Admins all student_email_campaigns" on public.student_email_campaigns;
create policy "Admins all student_email_campaigns"
  on public.student_email_campaigns for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins all student_email_deliveries" on public.student_email_deliveries;
create policy "Admins all student_email_deliveries"
  on public.student_email_deliveries for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

grant all on public.student_email_campaigns to authenticated;
grant all on public.student_email_deliveries to authenticated;
