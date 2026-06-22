-- Bilingual program title and description (EN / FA)
-- Run in Supabase Dashboard → SQL

alter table public.member_programs
  add column if not exists title_en text;

alter table public.member_programs
  add column if not exists title_fa text;

alter table public.member_programs
  add column if not exists description_en text;

alter table public.member_programs
  add column if not exists description_fa text;

update public.member_programs
set
  title_en = coalesce(nullif(trim(title_en), ''), title, ''),
  title_fa = coalesce(nullif(trim(title_fa), ''), title, ''),
  description_en = coalesce(nullif(trim(description_en), ''), description, ''),
  description_fa = coalesce(nullif(trim(description_fa), ''), description, '')
where title_en is null or trim(title_en) = '';

alter table public.member_programs
  alter column title_en set default '';

alter table public.member_programs
  alter column title_fa set default '';

alter table public.member_programs
  alter column description_en set default '';

alter table public.member_programs
  alter column description_fa set default '';
