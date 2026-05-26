-- Run AFTER you create your admin user in Supabase Auth (see supabase/SETUP.md)
-- Replace the email below with your admin login email.

insert into public.admin_profiles (id, email)
select id, email
from auth.users
where email = 'your-email@example.com'
on conflict (id) do nothing;
