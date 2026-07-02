-- Bonus programs: supplemental content linked to main programs with independent expiry.
-- Safe additive migration — existing programs default to program_type = 'main'.

alter table public.member_programs
  add column if not exists program_type text not null default 'main'
    check (program_type in ('main', 'bonus'));

create table if not exists public.program_bonus_links (
  id uuid primary key default gen_random_uuid(),
  bonus_program_id uuid not null references public.member_programs (id) on delete cascade,
  main_program_id uuid not null references public.member_programs (id) on delete cascade,
  access_ends_at timestamptz,
  created_at timestamptz not null default now(),
  unique (bonus_program_id, main_program_id)
);

create index if not exists program_bonus_links_bonus_idx
  on public.program_bonus_links (bonus_program_id);

create index if not exists program_bonus_links_main_idx
  on public.program_bonus_links (main_program_id);

-- Student has bonus access when enrolled in a linked main program (any enrollment status)
-- and the link has not expired (null access_ends_at = unlimited).
create or replace function public.has_bonus_program_access(p_bonus_program_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.program_bonus_links bl
    join public.program_enrollments e
      on e.program_id = bl.main_program_id
    join public.member_programs mp
      on mp.id = bl.bonus_program_id
    where bl.bonus_program_id = p_bonus_program_id
      and e.student_id = auth.uid()
      and mp.program_type = 'bonus'
      and mp.status = 'published'
      and (bl.access_ends_at is null or now() <= bl.access_ends_at)
  );
$$;

revoke all on function public.has_bonus_program_access(uuid) from public;
grant execute on function public.has_bonus_program_access(uuid) to authenticated;

alter table public.program_bonus_links enable row level security;

drop policy if exists "Admins all program_bonus_links" on public.program_bonus_links;
create policy "Admins all program_bonus_links"
  on public.program_bonus_links for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Students read accessible bonus links" on public.program_bonus_links;
drop policy if exists "Students read enrolled bonus links" on public.program_bonus_links;

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

-- Bonus program metadata (separate from enrollment-based main program read).
drop policy if exists "Students read accessible bonus programs" on public.member_programs;
create policy "Students read accessible bonus programs"
  on public.member_programs for select to authenticated
  using (
    public.is_student()
    and program_type = 'bonus'
    and public.has_bonus_program_access(id)
  );

-- Bonus lessons (all unlocked in app; no sequential gating).
drop policy if exists "Students read accessible bonus lessons" on public.program_lessons;
create policy "Students read accessible bonus lessons"
  on public.program_lessons for select to authenticated
  using (
    public.is_student()
    and exists (
      select 1
      from public.member_programs mp
      where mp.id = program_id
        and mp.program_type = 'bonus'
        and public.has_bonus_program_access(mp.id)
    )
  );

grant select on public.program_bonus_links to authenticated;

-- Bonus quiz content (additive policies; existing enrollment policies unchanged).
drop policy if exists "Students read bonus quiz questions" on public.lesson_quiz_questions;
create policy "Students read bonus quiz questions"
  on public.lesson_quiz_questions for select to authenticated
  using (
    public.is_student()
    and exists (
      select 1
      from public.program_lessons l
      join public.member_programs mp on mp.id = l.program_id
      where l.id = lesson_id
        and mp.program_type = 'bonus'
        and l.published_at is not null
        and public.has_bonus_program_access(mp.id)
    )
  );

drop policy if exists "Students read bonus quiz options" on public.lesson_quiz_options;
create policy "Students read bonus quiz options"
  on public.lesson_quiz_options for select to authenticated
  using (
    public.is_student()
    and exists (
      select 1
      from public.lesson_quiz_questions q
      join public.program_lessons l on l.id = q.lesson_id
      join public.member_programs mp on mp.id = l.program_id
      where q.id = question_id
        and mp.program_type = 'bonus'
        and l.published_at is not null
        and public.has_bonus_program_access(mp.id)
    )
  );
