-- Optional Iran price on Farsi locale rows (amount in millions of Toman). Run in Supabase SQL Editor.

alter table public.course_locales
  add column if not exists price_toman numeric(10, 2);

-- If you already added price_toman as bigint, widen to decimals:
alter table public.course_locales
  alter column price_toman type numeric(10, 2)
  using (case when price_toman is null then null else price_toman::numeric(10, 2) end);

comment on column public.course_locales.price_toman is
  'Optional FA price in millions of Toman (e.g. 2.50 = 2.5 million Toman). USD stays on courses.price_usd.';
