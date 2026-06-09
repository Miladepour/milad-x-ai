-- Student admin fields, enrollment payments, and visibility fix for enrolled students
-- Run in Supabase SQL editor after schema-member-portal.sql

alter table public.student_profiles
  add column if not exists phone text,
  add column if not exists notes text;

alter table public.program_enrollments
  add column if not exists amount_paid numeric(12, 2),
  add column if not exists currency text check (currency is null or currency in ('USD', 'GBP', 'IRR'));

-- Students can read programs they are actively enrolled in (draft or published)
drop policy if exists "Students read enrolled programs" on public.member_programs;
create policy "Students read enrolled programs"
  on public.member_programs for select to authenticated
  using (
    public.is_student()
    and exists (
      select 1
      from public.program_enrollments e
      where e.student_id = auth.uid()
        and e.program_id = member_programs.id
        and public.is_enrollment_active(e.status, e.access_starts_at, e.access_ends_at)
    )
  );

-- Students can read all lessons in programs they have active access to
drop policy if exists "Students read enrolled lessons" on public.program_lessons;
create policy "Students read enrolled lessons"
  on public.program_lessons for select to authenticated
  using (
    public.is_student()
    and public.has_program_access(program_id)
  );
