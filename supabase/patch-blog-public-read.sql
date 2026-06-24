-- Ensure public (anon) can read blog posts
-- Run if posts show in admin but not on /fa/blog

drop policy if exists "Public read blog posts" on public.blog_posts;
create policy "Public read blog posts"
  on public.blog_posts
  for select
  to anon, authenticated
  using (true);

grant select on public.blog_posts to anon, authenticated;
