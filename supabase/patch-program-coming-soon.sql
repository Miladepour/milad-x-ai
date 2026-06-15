-- Lock enrolled program content until materials are uploaded after a live course.
alter table public.member_programs
  add column if not exists coming_soon boolean not null default false;
