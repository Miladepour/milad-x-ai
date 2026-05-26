-- Run in Supabase SQL Editor if admin course import/publish fails with RLS errors.
-- Replaces the single "FOR ALL" admin policies with explicit per-operation policies.

drop policy if exists "Admins manage courses" on public.courses;
drop policy if exists "Admins read all courses" on public.courses;
drop policy if exists "Admins insert courses" on public.courses;
drop policy if exists "Admins update courses" on public.courses;
drop policy if exists "Admins delete courses" on public.courses;

create policy "Admins read all courses"
  on public.courses
  for select
  to authenticated
  using (public.is_admin());

create policy "Admins insert courses"
  on public.courses
  for insert
  to authenticated
  with check (public.is_admin());

create policy "Admins update courses"
  on public.courses
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins delete courses"
  on public.courses
  for delete
  to authenticated
  using (public.is_admin());

drop policy if exists "Admins manage course locales" on public.course_locales;
drop policy if exists "Admins read all course locales" on public.course_locales;
drop policy if exists "Admins insert course locales" on public.course_locales;
drop policy if exists "Admins update course locales" on public.course_locales;
drop policy if exists "Admins delete course locales" on public.course_locales;

create policy "Admins read all course locales"
  on public.course_locales
  for select
  to authenticated
  using (public.is_admin());

create policy "Admins insert course locales"
  on public.course_locales
  for insert
  to authenticated
  with check (public.is_admin());

create policy "Admins update course locales"
  on public.course_locales
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins delete course locales"
  on public.course_locales
  for delete
  to authenticated
  using (public.is_admin());
