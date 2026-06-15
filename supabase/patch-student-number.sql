-- Unique student ID numbers: MXAI + 5 digits (e.g. MXAI10482)
-- Run in Supabase Dashboard → SQL

create sequence if not exists public.student_number_seq;

alter table public.student_profiles
  add column if not exists student_number text;

-- Backfill existing students (oldest first)
with numbered as (
  select
    id,
    row_number() over (order by created_at asc, id asc) as rn
  from public.student_profiles
  where student_number is null
)
update public.student_profiles sp
set student_number = 'MXAI' || lpad(n.rn::text, 5, '0')
from numbered n
where sp.id = n.id;

-- Advance sequence past assigned numbers
select setval(
  'public.student_number_seq',
  coalesce(
    (
      select max(substring(student_number from 5)::integer)
      from public.student_profiles
      where student_number ~ '^MXAI[0-9]{5}$'
    ),
    0
  ) + 1,
  false
);

create unique index if not exists student_profiles_student_number_uidx
  on public.student_profiles (student_number);

alter table public.student_profiles
  alter column student_number set not null;

alter table public.student_profiles
  drop constraint if exists student_profiles_student_number_format_check;

alter table public.student_profiles
  add constraint student_profiles_student_number_format_check
  check (student_number ~ '^MXAI[0-9]{5}$');

create or replace function public.assign_student_number()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.student_number is null then
    loop
      new.student_number :=
        'MXAI' || lpad(nextval('public.student_number_seq')::text, 5, '0');
      exit when not exists (
        select 1
        from public.student_profiles
        where student_number = new.student_number
          and id is distinct from new.id
      );
    end loop;
  end if;
  return new;
end;
$$;

drop trigger if exists student_profiles_assign_number on public.student_profiles;

create trigger student_profiles_assign_number
  before insert or update on public.student_profiles
  for each row
  when (new.student_number is null)
  execute function public.assign_student_number();

-- Students cannot change their assigned ID
create or replace function public.guard_student_profile_self_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() then
    return new;
  end if;

  if new.id is distinct from old.id then
    raise exception 'profile id is immutable';
  end if;

  if new.email is distinct from old.email then
    raise exception 'email cannot be changed by students';
  end if;

  if new.student_number is distinct from old.student_number then
    raise exception 'student number cannot be changed by students';
  end if;

  if new.notes is distinct from old.notes then
    raise exception 'notes cannot be changed by students';
  end if;

  if new.created_at is distinct from old.created_at then
    raise exception 'created_at is immutable';
  end if;

  return new;
end;
$$;

drop trigger if exists guard_student_profile_self_update on public.student_profiles;

create trigger guard_student_profile_self_update
  before update on public.student_profiles
  for each row
  execute function public.guard_student_profile_self_update();
