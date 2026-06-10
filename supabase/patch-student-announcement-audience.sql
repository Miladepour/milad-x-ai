-- Student announcement audiences + optional CTA link
-- Run in Supabase Dashboard → SQL (after patch-student-announcements.sql)

alter table public.student_announcements
  add column if not exists audience_type text not null default 'all'
    check (audience_type in ('all', 'student', 'programs'));

alter table public.student_announcements
  add column if not exists student_id uuid references public.student_profiles (id) on delete set null;

alter table public.student_announcements
  add column if not exists program_ids uuid[] not null default '{}';

alter table public.student_announcements
  add column if not exists link_url text;

alter table public.student_announcements
  add column if not exists link_label text;

create index if not exists student_announcements_audience_idx
  on public.student_announcements (audience_type, student_id);

comment on column public.student_announcements.link_url is
  'Optional URL for the Learn more button on the student dashboard.';

comment on column public.student_announcements.link_label is
  'Optional button label; defaults to Learn more when link_url is set.';
