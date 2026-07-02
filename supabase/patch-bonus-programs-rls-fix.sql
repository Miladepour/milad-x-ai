-- Fix bonus link visibility for students (run after patch-bonus-programs.sql).
-- Students can read links for main programs they are enrolled in.

drop policy if exists "Students read accessible bonus links" on public.program_bonus_links;

create policy "Students read enrolled bonus links"
  on public.program_bonus_links for select to authenticated
  using (
    public.is_student()
    and exists (
      select 1
      from public.program_enrollments e
      join public.member_programs mp on mp.id = program_bonus_links.bonus_program_id
      where e.student_id = auth.uid()
        and e.program_id = program_bonus_links.main_program_id
        and mp.program_type = 'bonus'
        and mp.status = 'published'
        and (
          program_bonus_links.access_ends_at is null
          or now() <= program_bonus_links.access_ends_at
        )
    )
  );
