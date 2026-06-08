-- Storage RLS: public read for course/blog images; admin-only writes.
-- Run in Supabase Dashboard → SQL → New query.

-- Ensure buckets exist (admin-upload also creates them)
insert into storage.buckets (id, name, public)
values
  ('course-images', 'course-images', true),
  ('blog-images', 'blog-images', true)
on conflict (id) do update set public = excluded.public;

-- Public read for image buckets
drop policy if exists "Public read course images" on storage.objects;
create policy "Public read course images"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'course-images');

drop policy if exists "Public read blog images" on storage.objects;
create policy "Public read blog images"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'blog-images');

-- Admin-only writes
drop policy if exists "Admins upload course images" on storage.objects;
create policy "Admins upload course images"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'course-images' and public.is_admin());

drop policy if exists "Admins upload blog images" on storage.objects;
create policy "Admins upload blog images"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'blog-images' and public.is_admin());

drop policy if exists "Admins update storage objects" on storage.objects;
create policy "Admins update storage objects"
  on storage.objects
  for update
  to authenticated
  using (bucket_id in ('course-images', 'blog-images') and public.is_admin())
  with check (bucket_id in ('course-images', 'blog-images') and public.is_admin());

drop policy if exists "Admins delete storage objects" on storage.objects;
create policy "Admins delete storage objects"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id in ('course-images', 'blog-images') and public.is_admin());
