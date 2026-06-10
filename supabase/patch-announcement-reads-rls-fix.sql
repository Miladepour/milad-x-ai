-- Fix: students may only record read/dismiss state for announcements they can see.
-- Run in Supabase Dashboard → SQL (after patch-announcements-rls-fix.sql)

drop policy if exists "Students manage own announcement reads" on public.student_announcement_reads;

create policy "Students manage own announcement reads"
  on public.student_announcement_reads for all to authenticated
  using (
    public.is_student()
    and student_id = auth.uid()
    and exists (
      select 1
      from public.student_announcements a
      where a.id = announcement_id
        and a.published_at is not null
        and a.published_at <= now()
        and (a.expires_at is null or a.expires_at > now())
        and (
          a.audience_type = 'all'
          or (a.audience_type = 'student' and a.student_id = auth.uid())
          or (
            a.audience_type = 'programs'
            and exists (
              select 1
              from public.program_enrollments e
              where e.student_id = auth.uid()
                and e.program_id = any(a.program_ids)
                and public.is_enrollment_active(e.status, e.access_starts_at, e.access_ends_at)
            )
          )
        )
    )
  )
  with check (
    public.is_student()
    and student_id = auth.uid()
    and exists (
      select 1
      from public.student_announcements a
      where a.id = announcement_id
        and a.published_at is not null
        and a.published_at <= now()
        and (a.expires_at is null or a.expires_at > now())
        and (
          a.audience_type = 'all'
          or (a.audience_type = 'student' and a.student_id = auth.uid())
          or (
            a.audience_type = 'programs'
            and exists (
              select 1
              from public.program_enrollments e
              where e.student_id = auth.uid()
                and e.program_id = any(a.program_ids)
                and public.is_enrollment_active(e.status, e.access_starts_at, e.access_ends_at)
            )
          )
        )
    )
  );
