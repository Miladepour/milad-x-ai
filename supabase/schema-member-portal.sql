-- Member portal: invite-only student programs, lessons, enrollments, progress
-- Run after schema.sql in Supabase Dashboard → SQL

-- ---------------------------------------------------------------------------
-- Member programs (separate from public marketing courses)
-- ---------------------------------------------------------------------------
create table if not exists public.member_programs (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null default '',
  cover_image text,
  sort_order int not null default 0,
  status text not null default 'draft' check (status in ('draft', 'published')),
  useful_links jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists member_programs_sort_idx
  on public.member_programs (sort_order asc, created_at desc);

-- ---------------------------------------------------------------------------
-- Program lessons
-- ---------------------------------------------------------------------------
create table if not exists public.program_lessons (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.member_programs (id) on delete cascade,
  title text not null,
  description text not null default '',
  video_url text,
  sort_order int not null default 0,
  duration_minutes int,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists program_lessons_program_sort_idx
  on public.program_lessons (program_id, sort_order asc);

-- ---------------------------------------------------------------------------
-- Student profiles (links auth.users to member portal)
-- ---------------------------------------------------------------------------
create table if not exists public.student_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text not null default '',
  locale text not null default 'EN' check (locale in ('EN', 'FA')),
  phone text,
  notes text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Program enrollments
-- ---------------------------------------------------------------------------
create table if not exists public.program_enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.student_profiles (id) on delete cascade,
  program_id uuid not null references public.member_programs (id) on delete cascade,
  status text not null default 'invited' check (status in ('invited', 'active', 'suspended', 'expired')),
  access_starts_at timestamptz not null default now(),
  access_ends_at timestamptz,
  amount_paid numeric(12, 2),
  currency text check (currency is null or currency in ('USD', 'GBP', 'IRR')),
  invited_at timestamptz not null default now(),
  invited_by uuid references auth.users (id) on delete set null,
  last_accessed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, program_id)
);

create index if not exists program_enrollments_student_idx
  on public.program_enrollments (student_id);

create index if not exists program_enrollments_program_idx
  on public.program_enrollments (program_id);

-- ---------------------------------------------------------------------------
-- Lesson progress
-- ---------------------------------------------------------------------------
create table if not exists public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.student_profiles (id) on delete cascade,
  lesson_id uuid not null references public.program_lessons (id) on delete cascade,
  completed_at timestamptz,
  last_position_seconds int not null default 0,
  updated_at timestamptz not null default now(),
  unique (student_id, lesson_id)
);

create index if not exists lesson_progress_student_idx
  on public.lesson_progress (student_id);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
drop trigger if exists member_programs_set_updated_at on public.member_programs;
create trigger member_programs_set_updated_at
  before update on public.member_programs
  for each row
  execute function public.set_updated_at();

drop trigger if exists program_lessons_set_updated_at on public.program_lessons;
create trigger program_lessons_set_updated_at
  before update on public.program_lessons
  for each row
  execute function public.set_updated_at();

drop trigger if exists program_enrollments_set_updated_at on public.program_enrollments;
create trigger program_enrollments_set_updated_at
  before update on public.program_enrollments
  for each row
  execute function public.set_updated_at();

drop trigger if exists lesson_progress_set_updated_at on public.lesson_progress;
create trigger lesson_progress_set_updated_at
  before update on public.lesson_progress
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Helper functions
-- ---------------------------------------------------------------------------
create or replace function public.is_student()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.student_profiles where id = auth.uid()
  );
$$;

revoke all on function public.is_student() from public;
grant execute on function public.is_student() to authenticated;

create or replace function public.is_enrollment_active(
  p_status text,
  p_access_starts_at timestamptz,
  p_access_ends_at timestamptz
)
returns boolean
language sql
stable
as $$
  select
    p_status in ('invited', 'active')
    and now() >= p_access_starts_at
    and (p_access_ends_at is null or now() <= p_access_ends_at);
$$;

grant execute on function public.is_enrollment_active(text, timestamptz, timestamptz) to authenticated;

create or replace function public.has_program_access(p_program_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.program_enrollments e
    where e.student_id = auth.uid()
      and e.program_id = p_program_id
      and public.is_enrollment_active(e.status, e.access_starts_at, e.access_ends_at)
  );
$$;

revoke all on function public.has_program_access(uuid) from public;
grant execute on function public.has_program_access(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.member_programs enable row level security;
alter table public.program_lessons enable row level security;
alter table public.student_profiles enable row level security;
alter table public.program_enrollments enable row level security;
alter table public.lesson_progress enable row level security;

-- member_programs: admins full access; students read enrolled published programs
drop policy if exists "Admins all member_programs" on public.member_programs;
create policy "Admins all member_programs"
  on public.member_programs for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

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

-- program_lessons: admins full; students read published lessons in enrolled programs
drop policy if exists "Admins all program_lessons" on public.program_lessons;
create policy "Admins all program_lessons"
  on public.program_lessons for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Students read enrolled lessons" on public.program_lessons;
create policy "Students read enrolled lessons"
  on public.program_lessons for select to authenticated
  using (
    public.is_student()
    and public.has_program_access(program_id)
  );

-- student_profiles
drop policy if exists "Admins all student_profiles" on public.student_profiles;
create policy "Admins all student_profiles"
  on public.student_profiles for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Students read own profile" on public.student_profiles;
create policy "Students read own profile"
  on public.student_profiles for select to authenticated
  using (id = auth.uid());

drop policy if exists "Students update own profile" on public.student_profiles;
create policy "Students update own profile"
  on public.student_profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- program_enrollments
drop policy if exists "Admins all program_enrollments" on public.program_enrollments;
create policy "Admins all program_enrollments"
  on public.program_enrollments for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Students read own enrollments" on public.program_enrollments;
create policy "Students read own enrollments"
  on public.program_enrollments for select to authenticated
  using (student_id = auth.uid());

-- lesson_progress
drop policy if exists "Admins all lesson_progress" on public.lesson_progress;
create policy "Admins all lesson_progress"
  on public.lesson_progress for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Students manage own progress" on public.lesson_progress;
create policy "Students manage own progress"
  on public.lesson_progress for all to authenticated
  using (student_id = auth.uid()) with check (student_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------
grant all on public.member_programs to authenticated;
grant all on public.program_lessons to authenticated;
grant all on public.student_profiles to authenticated;
grant all on public.program_enrollments to authenticated;
grant all on public.lesson_progress to authenticated;
