-- Audience: newsletter subscribers + leads (marketing CRM)
-- Run in Supabase Dashboard → SQL

-- ---------------------------------------------------------------------------
-- Newsletter subscribers (opted-in email list)
-- ---------------------------------------------------------------------------
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  full_name text not null default '',
  locale text not null default 'EN' check (locale in ('EN', 'FA')),
  source text not null default 'website',
  source_detail text,
  status text not null default 'active' check (status in ('active', 'unsubscribed')),
  notes text,
  subscribed_at timestamptz not null default now(),
  unsubscribed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (email)
);

create index if not exists newsletter_subscribers_created_idx
  on public.newsletter_subscribers (created_at desc);

create index if not exists newsletter_subscribers_source_idx
  on public.newsletter_subscribers (source);

create index if not exists newsletter_subscribers_status_idx
  on public.newsletter_subscribers (status);

-- ---------------------------------------------------------------------------
-- Leads (webinar / event contacts with richer profile data)
-- ---------------------------------------------------------------------------
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  full_name text not null default '',
  phone text,
  country text,
  locale text not null default 'EN' check (locale in ('EN', 'FA')),
  source text not null default 'webinar',
  source_detail text,
  notes text,
  created_at timestamptz not null default now(),
  unique (email)
);

create index if not exists leads_created_idx
  on public.leads (created_at desc);

create index if not exists leads_source_idx
  on public.leads (source);

-- ---------------------------------------------------------------------------
-- Row level security (admin only)
-- ---------------------------------------------------------------------------
alter table public.newsletter_subscribers enable row level security;
alter table public.leads enable row level security;

drop policy if exists "Admins all newsletter_subscribers" on public.newsletter_subscribers;
create policy "Admins all newsletter_subscribers"
  on public.newsletter_subscribers for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins all leads" on public.leads;
create policy "Admins all leads"
  on public.leads for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

grant all on public.newsletter_subscribers to authenticated;
grant all on public.leads to authenticated;
