-- Run in Supabase SQL Editor if anon cannot read published courses (empty /courses page).
-- The Next.js app also reads via service role on the server; this patch restores anon + RLS.

grant usage on schema public to anon, authenticated;
grant select on public.courses to anon, authenticated;
grant select on public.course_locales to anon, authenticated;

drop policy if exists "Public read published courses" on public.courses;
create policy "Public read published courses"
  on public.courses
  for select
  to anon, authenticated
  using (published_at is not null);

drop policy if exists "Public read published course locales" on public.course_locales;
create policy "Public read published course locales"
  on public.course_locales
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.courses c
      where c.id = course_id
        and c.published_at is not null
    )
  );
