-- Add detailed rating columns to program_reviews
-- Run in Supabase Dashboard if you already applied patch-program-reviews.sql

alter table public.program_reviews
  add column if not exists rating_overall int
    check (rating_overall is null or (rating_overall >= 1 and rating_overall <= 5)),
  add column if not exists rating_clarity int
    check (rating_clarity is null or (rating_clarity >= 1 and rating_clarity <= 5)),
  add column if not exists rating_usefulness int
    check (rating_usefulness is null or (rating_usefulness >= 1 and rating_usefulness <= 5)),
  add column if not exists rating_teaching int
    check (rating_teaching is null or (rating_teaching >= 1 and rating_teaching <= 5)),
  add column if not exists rating_recommend int
    check (rating_recommend is null or (rating_recommend >= 1 and rating_recommend <= 5));

update public.program_reviews
set rating_overall = rating
where rating_overall is null and rating is not null;
