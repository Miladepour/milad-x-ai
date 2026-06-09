-- Track when admin has opened contact / waitlist submissions
-- Run in Supabase Dashboard → SQL

alter table public.contact_submissions
  add column if not exists opened_at timestamptz;

alter table public.waitlist_submissions
  add column if not exists opened_at timestamptz;

create index if not exists contact_submissions_unopened_idx
  on public.contact_submissions (submitted_at desc)
  where opened_at is null;

create index if not exists waitlist_submissions_unopened_idx
  on public.waitlist_submissions (submitted_at desc)
  where opened_at is null;
