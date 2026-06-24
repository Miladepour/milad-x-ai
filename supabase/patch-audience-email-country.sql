-- Add country filter to audience email campaigns (run after patch-audience-email.sql)

alter table public.audience_email_campaigns
  add column if not exists country_filter text;
