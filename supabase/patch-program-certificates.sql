-- Program completion certificates
-- Run in Supabase Dashboard → SQL

alter table public.member_programs
  add column if not exists certificate_enabled boolean not null default false,
  add column if not exists certificate_title_en text,
  add column if not exists certificate_title_fa text,
  add column if not exists certificate_hours numeric(8, 2);

create sequence if not exists public.certificate_number_seq;

create table if not exists public.program_certificates (
  id uuid primary key default gen_random_uuid(),
  certificate_number text not null unique,
  student_id uuid not null references public.student_profiles (id) on delete cascade,
  program_id uuid not null references public.member_programs (id) on delete cascade,
  enrollment_id uuid references public.program_enrollments (id) on delete set null,
  student_name text not null,
  student_number text not null,
  program_title_en text not null,
  program_title_fa text not null,
  total_hours numeric(8, 2) not null default 0,
  issued_at timestamptz not null default now(),
  issued_by uuid references auth.users (id) on delete set null,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists program_certificates_active_uidx
  on public.program_certificates (student_id, program_id)
  where revoked_at is null;

create index if not exists program_certificates_number_idx
  on public.program_certificates (certificate_number);

alter table public.program_certificates
  drop constraint if exists program_certificates_number_format_check;

alter table public.program_certificates
  add constraint program_certificates_number_format_check
  check (certificate_number ~ '^MXAICERT[0-9]{6}$');

create or replace function public.assign_certificate_number()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.certificate_number is null then
    loop
      new.certificate_number :=
        'MXAICERT' || lpad(nextval('public.certificate_number_seq')::text, 6, '0');
      exit when not exists (
        select 1
        from public.program_certificates
        where certificate_number = new.certificate_number
      );
    end loop;
  end if;
  return new;
end;
$$;

drop trigger if exists program_certificates_assign_number on public.program_certificates;

create trigger program_certificates_assign_number
  before insert on public.program_certificates
  for each row
  when (new.certificate_number is null)
  execute function public.assign_certificate_number();

alter table public.program_certificates enable row level security;

drop policy if exists "Admins all program_certificates" on public.program_certificates;
create policy "Admins all program_certificates"
  on public.program_certificates for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Students read own program_certificates" on public.program_certificates;
create policy "Students read own program_certificates"
  on public.program_certificates for select to authenticated
  using (
    public.is_student()
    and student_id = auth.uid()
    and revoked_at is null
  );

grant select on public.program_certificates to authenticated;
