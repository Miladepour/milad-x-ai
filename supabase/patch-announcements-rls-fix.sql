-- Fix: enforce announcement audience targeting at the database layer.
-- Run in Supabase Dashboard → SQL (after patch-student-announcement-audience.sql)

drop policy if exists "Students read published announcements" on public.student_announcements;

create policy "Students read published announcements"
  on public.student_announcements for select to authenticated
  using (
    public.is_student()
    and published_at is not null
    and published_at <= now()
    and (expires_at is null or expires_at > now())
    and (
      audience_type = 'all'
      or (audience_type = 'student' and student_id = auth.uid())
      or (
        audience_type = 'programs'
        and exists (
          select 1
          from public.program_enrollments e
          where e.student_id = auth.uid()
            and e.program_id = any(program_ids)
            and public.is_enrollment_active(e.status, e.access_starts_at, e.access_ends_at)
        )
      )
    )
  );
