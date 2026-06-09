-- Student dashboard announcements (admin → students)
-- Run in Supabase Dashboard → SQL

create table if not exists public.student_announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null default '',
  locale text not null default 'ALL' check (locale in ('EN', 'FA', 'ALL')),
  published_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists student_announcements_published_idx
  on public.student_announcements (published_at desc nulls last);

alter table public.student_announcements enable row level security;

drop policy if exists "Admins all student_announcements" on public.student_announcements;
create policy "Admins all student_announcements"
  on public.student_announcements for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Students read published announcements" on public.student_announcements;
create policy "Students read published announcements"
  on public.student_announcements for select to authenticated
  using (
    public.is_student()
    and published_at is not null
    and published_at <= now()
    and (expires_at is null or expires_at > now())
  );

grant all on public.student_announcements to authenticated;
