-- Audience email templates, campaigns, and delivery queue
-- Run in Supabase Dashboard → SQL (after patch-audience.sql)

create table if not exists public.audience_email_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  subject text not null,
  body_html text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.audience_email_campaigns (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  body_html text not null default '',
  list_type text not null check (list_type in ('subscribers', 'leads', 'waitlist')),
  audience_label text not null default '',
  source_filter text,
  course_slug text,
  student_filter text not null default 'all'
    check (student_filter in ('all', 'students', 'non-students')),
  status text not null default 'sending'
    check (status in ('sending', 'completed', 'cancelled')),
  sent_by uuid references auth.users (id) on delete set null,
  recipient_count int not null default 0,
  sent_count int not null default 0,
  failed_count int not null default 0,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.audience_email_deliveries (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.audience_email_campaigns (id) on delete cascade,
  recipient_email text not null,
  recipient_name text not null default '',
  locale text not null default 'EN' check (locale in ('EN', 'FA')),
  resend_message_id text,
  status text not null default 'pending'
    check (status in ('pending', 'sent', 'failed')),
  status_detail text,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

create index if not exists audience_email_templates_updated_idx
  on public.audience_email_templates (updated_at desc);

create index if not exists audience_email_campaigns_created_idx
  on public.audience_email_campaigns (created_at desc);

create index if not exists audience_email_deliveries_campaign_idx
  on public.audience_email_deliveries (campaign_id);

create index if not exists audience_email_deliveries_pending_idx
  on public.audience_email_deliveries (campaign_id, status)
  where status = 'pending';

alter table public.audience_email_templates enable row level security;
alter table public.audience_email_campaigns enable row level security;
alter table public.audience_email_deliveries enable row level security;

drop policy if exists "Admins all audience_email_templates" on public.audience_email_templates;
create policy "Admins all audience_email_templates"
  on public.audience_email_templates for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins all audience_email_campaigns" on public.audience_email_campaigns;
create policy "Admins all audience_email_campaigns"
  on public.audience_email_campaigns for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins all audience_email_deliveries" on public.audience_email_deliveries;
create policy "Admins all audience_email_deliveries"
  on public.audience_email_deliveries for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

grant all on public.audience_email_templates to authenticated;
grant all on public.audience_email_campaigns to authenticated;
grant all on public.audience_email_deliveries to authenticated;
