-- Revoke direct public inserts on contact/waitlist forms.
-- Submissions must go through /api/contact and /api/waitlist (service role).
-- Run in Supabase Dashboard → SQL → New query.

drop policy if exists "Public insert contact" on public.contact_submissions;
drop policy if exists "Public insert waitlist" on public.waitlist_submissions;

revoke insert on public.contact_submissions from anon;
revoke insert on public.waitlist_submissions from anon;
