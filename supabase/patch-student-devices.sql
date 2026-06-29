-- Student device tracking (soft mode: register only, no cap enforcement in app yet)
-- Run in Supabase Dashboard → SQL after schema-member-portal.sql

create table if not exists public.student_devices (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.student_profiles (id) on delete cascade,
  token_hash text not null,
  label text not null default 'Unknown device',
  user_agent text,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (student_id, token_hash)
);

create index if not exists student_devices_student_idx
  on public.student_devices (student_id, last_seen_at desc);

alter table public.student_devices enable row level security;

drop policy if exists "Admins all student_devices" on public.student_devices;
create policy "Admins all student_devices"
  on public.student_devices for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Students read own devices" on public.student_devices;
create policy "Students read own devices"
  on public.student_devices for select to authenticated
  using (student_id = auth.uid());

drop policy if exists "Students insert own devices" on public.student_devices;
create policy "Students insert own devices"
  on public.student_devices for insert to authenticated
  with check (student_id = auth.uid());

drop policy if exists "Students update own devices" on public.student_devices;
create policy "Students update own devices"
  on public.student_devices for update to authenticated
  using (student_id = auth.uid()) with check (student_id = auth.uid());

drop policy if exists "Students delete own devices" on public.student_devices;
create policy "Students delete own devices"
  on public.student_devices for delete to authenticated
  using (student_id = auth.uid());

grant select, insert, update, delete on public.student_devices to authenticated;
