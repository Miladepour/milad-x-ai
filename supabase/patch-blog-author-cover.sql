-- Blog enhancements: author + cover image.
-- Run in Supabase SQL Editor on existing projects.

alter table public.blog_posts
  add column if not exists author text not null default 'Milad';

alter table public.blog_posts
  add column if not exists cover_image text;

comment on column public.blog_posts.author is 'Author display name for blog post.';
comment on column public.blog_posts.cover_image is 'Optional cover image URL (Supabase Storage public URL).';

