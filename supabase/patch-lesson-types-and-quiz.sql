-- Lesson types (video / text / quiz), bilingual content, and quiz tables.
-- Run in Supabase Dashboard → SQL

alter table public.program_lessons
  add column if not exists lesson_type text not null default 'video'
    check (lesson_type in ('video', 'text', 'quiz'));

alter table public.program_lessons
  add column if not exists title_en text;

alter table public.program_lessons
  add column if not exists title_fa text;

alter table public.program_lessons
  add column if not exists body_en text;

alter table public.program_lessons
  add column if not exists body_fa text;

-- Backfill from legacy title / description columns
update public.program_lessons
set
  title_en = coalesce(nullif(trim(title_en), ''), title, ''),
  title_fa = coalesce(nullif(trim(title_fa), ''), title, ''),
  body_en = coalesce(nullif(trim(body_en), ''), description, ''),
  body_fa = coalesce(nullif(trim(body_fa), ''), description, ''),
  lesson_type = case
    when lesson_type = 'quiz' then 'quiz'
    when coalesce(video_url, '') <> '' then 'video'
    else 'text'
  end
where title_en is null or trim(title_en) = '';

alter table public.program_lessons
  alter column title_en set default '';

alter table public.program_lessons
  alter column title_fa set default '';

alter table public.program_lessons
  alter column body_en set default '';

alter table public.program_lessons
  alter column body_fa set default '';

create table if not exists public.lesson_quiz_questions (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.program_lessons (id) on delete cascade,
  sort_order int not null default 0,
  prompt_en text not null default '',
  prompt_fa text not null default '',
  explanation_en text not null default '',
  explanation_fa text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lesson_quiz_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.lesson_quiz_questions (id) on delete cascade,
  sort_order int not null default 0,
  label_en text not null default '',
  label_fa text not null default '',
  is_correct boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.lesson_quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.student_profiles (id) on delete cascade,
  lesson_id uuid not null references public.program_lessons (id) on delete cascade,
  score_percent int not null default 0,
  passed boolean not null default false,
  answers jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists lesson_quiz_questions_lesson_idx
  on public.lesson_quiz_questions (lesson_id, sort_order);

create index if not exists lesson_quiz_options_question_idx
  on public.lesson_quiz_options (question_id, sort_order);

create index if not exists lesson_quiz_attempts_student_lesson_idx
  on public.lesson_quiz_attempts (student_id, lesson_id, created_at desc);

alter table public.lesson_quiz_questions enable row level security;
alter table public.lesson_quiz_options enable row level security;
alter table public.lesson_quiz_attempts enable row level security;

drop policy if exists "Admins all lesson_quiz_questions" on public.lesson_quiz_questions;
create policy "Admins all lesson_quiz_questions"
  on public.lesson_quiz_questions for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Students read enrolled quiz questions" on public.lesson_quiz_questions;
create policy "Students read enrolled quiz questions"
  on public.lesson_quiz_questions for select to authenticated
  using (
    public.is_student()
    and exists (
      select 1
      from public.program_lessons l
      join public.program_enrollments e on e.program_id = l.program_id
      where l.id = lesson_id
        and e.student_id = auth.uid()
        and l.published_at is not null
        and l.lesson_type = 'quiz'
    )
  );

drop policy if exists "Admins all lesson_quiz_options" on public.lesson_quiz_options;
create policy "Admins all lesson_quiz_options"
  on public.lesson_quiz_options for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Students read enrolled quiz options" on public.lesson_quiz_options;
create policy "Students read enrolled quiz options"
  on public.lesson_quiz_options for select to authenticated
  using (
    public.is_student()
    and exists (
      select 1
      from public.lesson_quiz_questions q
      join public.program_lessons l on l.id = q.lesson_id
      join public.program_enrollments e on e.program_id = l.program_id
      where q.id = question_id
        and e.student_id = auth.uid()
        and l.published_at is not null
    )
  );

drop policy if exists "Admins all lesson_quiz_attempts" on public.lesson_quiz_attempts;
create policy "Admins all lesson_quiz_attempts"
  on public.lesson_quiz_attempts for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Students manage own quiz attempts" on public.lesson_quiz_attempts;
create policy "Students manage own quiz attempts"
  on public.lesson_quiz_attempts for all to authenticated
  using (student_id = auth.uid()) with check (student_id = auth.uid());

grant select on public.lesson_quiz_questions to authenticated;
grant select on public.lesson_quiz_options to authenticated;
grant select, insert on public.lesson_quiz_attempts to authenticated;
