-- Allow students to save progress for bonus program lessons they can access.
-- Run in Supabase Dashboard → SQL (after patch-bonus-programs.sql).

drop policy if exists "Students manage own progress" on public.lesson_progress;

create policy "Students manage own progress"
  on public.lesson_progress for all to authenticated
  using (student_id = auth.uid())
  with check (
    student_id = auth.uid()
    and (
      public.has_program_access(
        (select program_id from public.program_lessons where id = lesson_id)
      )
      or public.has_bonus_program_access(
        (select program_id from public.program_lessons where id = lesson_id)
      )
    )
  );
