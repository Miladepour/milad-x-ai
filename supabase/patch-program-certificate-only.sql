-- Certificate-only programs: no lesson curriculum; admin issues certificates manually.
-- Run in Supabase Dashboard → SQL

alter table public.member_programs
  add column if not exists certificate_only boolean not null default false;
