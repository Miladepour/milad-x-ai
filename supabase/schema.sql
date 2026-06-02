-- Milad X AI — Supabase schema
-- Run this entire file in: Supabase Dashboard → SQL → New query → Run

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Admin profiles (links Supabase Auth users to site admin access)
-- ---------------------------------------------------------------------------
create table if not exists public.admin_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  created_at timestamptz not null default now()
);

comment on table public.admin_profiles is
  'Users allowed to sign in to the Milad X AI admin console.';

-- ---------------------------------------------------------------------------
-- Blog posts (replaces data/blog-posts.json)
-- ---------------------------------------------------------------------------
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  locale text not null check (locale in ('EN', 'FA')),
  title text not null,
  author text not null default 'Milad',
  cover_image text,
  excerpt text not null,
  content text not null,
  date text not null,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (slug, locale)
);

create index if not exists blog_posts_locale_published_idx
  on public.blog_posts (locale, published_at desc);

-- ---------------------------------------------------------------------------
-- Contact form submissions (replaces data/contact-submissions.json)
-- ---------------------------------------------------------------------------
create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  mobile text not null,
  country text not null,
  inquiry_type text not null check (inquiry_type in ('private_course', 'collaboration')),
  message text not null,
  locale text not null default 'EN',
  submitted_at timestamptz not null default now()
);

create index if not exists contact_submissions_submitted_at_idx
  on public.contact_submissions (submitted_at desc);

-- ---------------------------------------------------------------------------
-- Course waitlist (replaces data/waitlist-submissions.json)
-- ---------------------------------------------------------------------------
create table if not exists public.waitlist_submissions (
  id uuid primary key default gen_random_uuid(),
  course_slug text not null,
  full_name text not null,
  email text not null,
  mobile text not null,
  country text not null,
  locale text not null default 'EN',
  submitted_at timestamptz not null default now()
);

create index if not exists waitlist_submissions_submitted_at_idx
  on public.waitlist_submissions (submitted_at desc);

create index if not exists waitlist_submissions_course_slug_idx
  on public.waitlist_submissions (course_slug);

-- ---------------------------------------------------------------------------
-- Courses (bilingual CMS)
-- ---------------------------------------------------------------------------
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  cover_image text not null,
  price_usd numeric(10, 2) not null default 0,
  sort_order int not null default 0,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists courses_published_sort_idx
  on public.courses (published_at desc nulls last, sort_order asc);

create table if not exists public.course_locales (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  locale text not null check (locale in ('EN', 'FA')),
  list_title text not null,
  title text not null,
  subtitle text not null,
  excerpt text not null,
  date text not null,
  status text not null check (status in ('Live', 'Coming Soon', 'Closed')),
  content jsonb not null default '{}'::jsonb,
  price_toman numeric(10, 2),
  unique (course_id, locale)
);

create index if not exists course_locales_course_id_idx
  on public.course_locales (course_id);

-- ---------------------------------------------------------------------------
-- updated_at trigger for blog_posts
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists blog_posts_set_updated_at on public.blog_posts;
create trigger blog_posts_set_updated_at
  before update on public.blog_posts
  for each row
  execute function public.set_updated_at();

drop trigger if exists courses_set_updated_at on public.courses;
create trigger courses_set_updated_at
  before update on public.courses
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Helper: is the current user an admin?
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.admin_profiles
    where id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated, anon;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.admin_profiles enable row level security;
alter table public.blog_posts enable row level security;
alter table public.contact_submissions enable row level security;
alter table public.waitlist_submissions enable row level security;
alter table public.courses enable row level security;
alter table public.course_locales enable row level security;

-- admin_profiles: admins can read their own row
drop policy if exists "Admins read own profile" on public.admin_profiles;
create policy "Admins read own profile"
  on public.admin_profiles
  for select
  to authenticated
  using (id = auth.uid());

-- blog_posts: public read (site blog)
drop policy if exists "Public read blog posts" on public.blog_posts;
create policy "Public read blog posts"
  on public.blog_posts
  for select
  to anon, authenticated
  using (true);

-- blog_posts: admins write
drop policy if exists "Admins insert blog posts" on public.blog_posts;
create policy "Admins insert blog posts"
  on public.blog_posts
  for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "Admins update blog posts" on public.blog_posts;
create policy "Admins update blog posts"
  on public.blog_posts
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins delete blog posts" on public.blog_posts;
create policy "Admins delete blog posts"
  on public.blog_posts
  for delete
  to authenticated
  using (public.is_admin());

-- contact_submissions: anyone can submit (public form)
drop policy if exists "Public insert contact" on public.contact_submissions;
create policy "Public insert contact"
  on public.contact_submissions
  for insert
  to anon, authenticated
  with check (true);

-- contact_submissions: admins read
drop policy if exists "Admins read contact" on public.contact_submissions;
create policy "Admins read contact"
  on public.contact_submissions
  for select
  to authenticated
  using (public.is_admin());

-- waitlist_submissions: anyone can submit
drop policy if exists "Public insert waitlist" on public.waitlist_submissions;
create policy "Public insert waitlist"
  on public.waitlist_submissions
  for insert
  to anon, authenticated
  with check (true);

-- waitlist_submissions: admins read
drop policy if exists "Admins read waitlist" on public.waitlist_submissions;
create policy "Admins read waitlist"
  on public.waitlist_submissions
  for select
  to authenticated
  using (public.is_admin());

-- courses: public read published only
drop policy if exists "Public read published courses" on public.courses;
create policy "Public read published courses"
  on public.courses
  for select
  to anon, authenticated
  using (published_at is not null);

-- courses: admins read all (including drafts)
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

-- course_locales: public read when parent published
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

-- course_locales: admins read/write all
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

-- ---------------------------------------------------------------------------
-- Grant table access to API roles
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant select on public.blog_posts to anon, authenticated;
grant insert on public.contact_submissions to anon, authenticated;
grant insert on public.waitlist_submissions to anon, authenticated;
grant select on public.admin_profiles to authenticated;
grant all on public.blog_posts to authenticated;
grant select on public.contact_submissions to authenticated;
grant select on public.waitlist_submissions to authenticated;
grant select on public.courses to anon, authenticated;
grant select on public.course_locales to anon, authenticated;
grant all on public.courses to authenticated;
grant all on public.course_locales to authenticated;
