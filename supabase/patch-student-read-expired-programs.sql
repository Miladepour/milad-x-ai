-- Allow students to read program metadata for any enrollment (including expired).
-- Lesson access remains gated by has_program_access() (active enrollment only).

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
    )
  );
