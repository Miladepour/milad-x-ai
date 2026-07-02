-- Program reviews: public submission via API, admin read/manage
-- Run in Supabase Dashboard → SQL → New query

create table if not exists public.program_reviews (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.member_programs (id) on delete cascade,
  reviewer_name text not null,
  rating int not null check (rating >= 1 and rating <= 5),
  rating_overall int check (rating_overall >= 1 and rating_overall <= 5),
  rating_clarity int check (rating_clarity >= 1 and rating_clarity <= 5),
  rating_usefulness int check (rating_usefulness >= 1 and rating_usefulness <= 5),
  rating_teaching int check (rating_teaching >= 1 and rating_teaching <= 5),
  rating_recommend int check (rating_recommend >= 1 and rating_recommend <= 5),
  public_review text not null default '',
  private_review text,
  locale text not null default 'EN' check (locale in ('EN', 'FA')),
  source text not null default 'shared_link'
    check (source in ('shared_link', 'email_invite')),
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'published')),
  consent_public_display boolean not null default false,
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists program_reviews_program_idx
  on public.program_reviews (program_id, submitted_at desc);

create index if not exists program_reviews_status_idx
  on public.program_reviews (status, submitted_at desc);

create index if not exists program_reviews_rating_idx
  on public.program_reviews (rating);

alter table public.program_reviews enable row level security;

drop policy if exists "Admins all program_reviews" on public.program_reviews;
create policy "Admins all program_reviews"
  on public.program_reviews for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

grant all on public.program_reviews to authenticated;
