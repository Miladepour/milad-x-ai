-- Per-student announcement read + dismiss state
-- Run in Supabase Dashboard → SQL

create table if not exists public.student_announcement_reads (
  student_id uuid not null references public.student_profiles (id) on delete cascade,
  announcement_id uuid not null references public.student_announcements (id) on delete cascade,
  read_at timestamptz,
  dismissed_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (student_id, announcement_id)
);

create index if not exists student_announcement_reads_student_idx
  on public.student_announcement_reads (student_id, dismissed_at);

alter table public.student_announcement_reads enable row level security;

drop policy if exists "Students manage own announcement reads" on public.student_announcement_reads;
create policy "Students manage own announcement reads"
  on public.student_announcement_reads for all to authenticated
  using (
    public.is_student()
    and student_id = auth.uid()
  )
  with check (
    public.is_student()
    and student_id = auth.uid()
  );

grant select, insert, update on public.student_announcement_reads to authenticated;
