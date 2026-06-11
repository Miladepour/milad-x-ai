-- Fix student announcement visibility (re-run in Supabase SQL Editor).
-- Handles legacy null audience_type and locale targeting for broadcast announcements.

drop policy if exists "Students read published announcements" on public.student_announcements;

create policy "Students read published announcements"
  on public.student_announcements for select to authenticated
  using (
    public.is_student()
    and published_at is not null
    and published_at <= now()
    and (expires_at is null or expires_at > now())
    and (
      (
        coalesce(audience_type, 'all') = 'all'
        and (
          locale = 'ALL'
          or locale = (
            select sp.locale
            from public.student_profiles sp
            where sp.id = auth.uid()
          )
        )
      )
      or (audience_type = 'student' and student_id = auth.uid())
      or (
        audience_type = 'programs'
        and coalesce(array_length(program_ids, 1), 0) > 0
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
