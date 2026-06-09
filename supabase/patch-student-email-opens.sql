-- Add email open tracking (requires Resend domain open_tracking + email.opened webhook)
-- Run in Supabase Dashboard → SQL

alter table public.student_email_deliveries
  add column if not exists opened_at timestamptz;

alter table public.student_email_deliveries
  drop constraint if exists student_email_deliveries_status_check;

alter table public.student_email_deliveries
  add constraint student_email_deliveries_status_check
  check (status in ('sent', 'delivered', 'opened', 'bounced', 'complained', 'failed', 'delayed'));
