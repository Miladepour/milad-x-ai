-- Allow admins to mark contact / waitlist submissions as opened.
-- Run in Supabase Dashboard → SQL (after patch-submission-opened.sql)

alter table public.contact_submissions
  add column if not exists opened_at timestamptz;

alter table public.waitlist_submissions
  add column if not exists opened_at timestamptz;

drop policy if exists "Admins update contact opened" on public.contact_submissions;
create policy "Admins update contact opened"
  on public.contact_submissions
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins update waitlist opened" on public.waitlist_submissions;
create policy "Admins update waitlist opened"
  on public.waitlist_submissions
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant update on public.contact_submissions to authenticated;
grant update on public.waitlist_submissions to authenticated;
