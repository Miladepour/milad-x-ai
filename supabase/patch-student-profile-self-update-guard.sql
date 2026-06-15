-- Harden student self-service profile updates at the database layer.
-- Students may only change full_name, locale, and phone on their own row.
-- Run in Supabase Dashboard → SQL

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

-- Defense in depth: students should never update enrollments directly.
-- Admin enrollment writes use the service role in app code (addEnrollmentAdmin).
revoke update on public.program_enrollments from authenticated;
grant select on public.program_enrollments to authenticated;
