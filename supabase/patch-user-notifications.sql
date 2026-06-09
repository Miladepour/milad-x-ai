-- In-app notifications for admin and student panels
-- Run in Supabase Dashboard → SQL

create table if not exists public.user_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('contact', 'waitlist', 'announcement', 'system')),
  title text not null,
  body text not null default '',
  href text,
  reference_id text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists user_notifications_user_created_idx
  on public.user_notifications (user_id, created_at desc);

create index if not exists user_notifications_user_unread_idx
  on public.user_notifications (user_id)
  where read_at is null;

create unique index if not exists user_notifications_user_kind_ref_idx
  on public.user_notifications (user_id, kind, reference_id)
  where reference_id is not null;

alter table public.user_notifications enable row level security;

drop policy if exists "Users read own notifications" on public.user_notifications;
create policy "Users read own notifications"
  on public.user_notifications for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users update own notifications" on public.user_notifications;
create policy "Users update own notifications"
  on public.user_notifications for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select, update on public.user_notifications to authenticated;
