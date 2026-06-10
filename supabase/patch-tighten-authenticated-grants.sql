-- Least-privilege grants for authenticated role (RLS still applies).
-- Admin writes use service role; students only need read + limited writes.
-- Run in Supabase Dashboard → SQL

-- Member portal
revoke insert, update, delete on public.member_programs from authenticated;
grant select on public.member_programs to authenticated;

revoke insert, update, delete on public.program_lessons from authenticated;
grant select on public.program_lessons to authenticated;

revoke insert, delete on public.program_enrollments from authenticated;
grant select, update on public.program_enrollments to authenticated;

revoke delete on public.student_profiles from authenticated;
grant select, update on public.student_profiles to authenticated;

revoke delete on public.lesson_progress from authenticated;
grant select, insert, update on public.lesson_progress to authenticated;

revoke insert, update, delete on public.student_announcements from authenticated;
grant select on public.student_announcements to authenticated;

revoke all on public.student_email_campaigns from authenticated;
revoke all on public.student_email_deliveries from authenticated;

-- Blog / courses (admins use service role for writes)
revoke insert, update, delete on public.blog_posts from authenticated;
grant select on public.blog_posts to authenticated;

revoke insert, update, delete on public.courses from authenticated;
grant select on public.courses to authenticated;

revoke insert, update, delete on public.course_locales from authenticated;
grant select on public.course_locales to authenticated;
