# Supabase setup (manual)

Follow these steps in the [Supabase Dashboard](https://supabase.com/dashboard). The site still uses local JSON files until you wire the Next.js app to Supabase (next phase).

## 1. Create a project

1. Go to **New project**.
2. Pick an organization, name (e.g. `milad-x-ai`), database password, and region.
3. Wait until the project status is **Active**.

## 2. Run the database schema

1. Open **SQL** → **New query**.
2. Copy the full contents of [`schema.sql`](./schema.sql) in this folder.
3. Paste into the editor and click **Run**.
4. Confirm success (no errors). You should see tables:
   - `admin_profiles`
   - `blog_posts`
   - `contact_submissions`
   - `waitlist_submissions`
   - `courses`
   - `course_locales`

## 3. Enable email login (admin)

1. Go to **Authentication** → **Providers**.
2. Open **Email**.
3. Turn **Enable Email provider** ON.
4. For production, configure **Confirm email** as you prefer (you can disable it while testing so login works immediately).
5. Save.

## 4. Auth URL settings (required for login)

1. Go to **Authentication** → **URL Configuration**.
2. Set **Site URL** to your site, e.g.:
   - Local: `http://localhost:3000`
   - Production: `https://www.mxaiacademy.com`
3. Under **Redirect URLs**, add (one per line):
   - `http://localhost:3000/**`
   - `https://www.mxaiacademy.com/**`
   - `https://mxaiacademy.com/**` (optional; redirect apex to www in Vercel)
   - Your secret admin path if you use auth callbacks there later, e.g. `http://localhost:3000/mx-console-*/**`

## 5. Create your admin user

1. Go to **Authentication** → **Users**.
2. Click **Add user** → **Create new user**.
3. Enter your **email** and a **strong password**.
4. Enable **Auto Confirm User** if you are not using email confirmation yet.
5. Create the user.

## 6. Grant admin access in the database

Only users listed in `admin_profiles` can use the admin console once Supabase auth is connected.

1. Open **SQL** → **New query**.
2. Copy [`seed-admin.sql`](./seed-admin.sql), replace `your-email@example.com` with the email from step 5.
3. Run the query.
4. Optional check:

```sql
select * from public.admin_profiles;
```

You should see one row with your user `id` and `email`.

## 7. Copy API keys into the project

1. In Supabase, go to **Project Settings** → **API**.
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (server only — never expose in the browser)
3. In your project root, create or update `.env.local` (see `.env.example`):

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

4. Restart `npm run dev` after changing env vars.

## 8. (Optional) Migrate existing JSON data

If you have submissions or blog posts in `/data/` locally:

1. **Table Editor** → open each table → **Insert** → **Import data from CSV**, or
2. Run custom `INSERT` statements in the SQL editor.

Column mapping:

| JSON / app field | `blog_posts` column |
|------------------|---------------------|
| `slug` | `slug` |
| `locale` | `locale` |
| `title` | `title` |
| `excerpt` | `excerpt` |
| `content` | `content` |
| `date` | `date` |
| `publishedAt` | `published_at` |

| JSON field | `contact_submissions` |
|------------|----------------------|
| `fullName` | `full_name` |
| `email` | `email` |
| `mobile` | `mobile` |
| `country` | `country` |
| `inquiryType` | `inquiry_type` |
| `message` | `message` |
| `locale` | `locale` |
| `submittedAt` | `submitted_at` |

| JSON field | `waitlist_submissions` |
|------------|------------------------|
| `courseSlug` | `course_slug` |
| `fullName` | `full_name` |
| … | (same pattern as contact) |

## 9. Security checklist

### Supabase Attack Protection (enable after deploy)

1. Deploy this repo so admin login includes Turnstile + `captchaToken` on sign-in.
2. Supabase Dashboard → **Authentication** → **Attack Protection**.
3. Enable **Captcha protection**.
4. Provider: **Cloudflare Turnstile**.
5. Secret key: paste the same value as `TURNSTILE_SECRET_KEY` in Vercel (not the site key).
6. Save, then test admin login at your secret admin URL — Turnstile must show and sign-in must succeed.

If captcha is enabled before deploy, admin login will fail with a captcha error until the new code is live.

- [ ] `SUPABASE_SERVICE_ROLE_KEY` is only in `.env.local` / Vercel env — never committed.
- [ ] Row Level Security is enabled (the schema does this).
- [ ] Run `patch-form-insert-rls.sql` so contact/waitlist inserts go through API only.
- [ ] Run `patch-storage-policies.sql` for admin-only image uploads.
- [ ] Set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` in Vercel (Cloudflare Turnstile).
- [ ] Only your email is in `admin_profiles`.
- [ ] Enable **MFA (TOTP)** in Supabase → Authentication → Multi-Factor, then enroll on first admin sign-in (QR code in the login flow).
- [ ] Enable **Attack Protection** in Supabase → Authentication → Attack Protection → Turnstile, using the same `TURNSTILE_SECRET_KEY` as Vercel (admin login sends `captchaToken` on sign-in).
- [ ] Set `ADMIN_PATH_SEGMENT` in production; `/admin` must return 404 when visited directly.
- [ ] Production **Site URL** and **Redirect URLs** match your real domain.
- [ ] Upgrade to **Vercel Pro** when selling paid courses (Hobby = non-commercial only).

## What’s in the repo (for the next coding step)

| File | Purpose |
|------|---------|
| `supabase/schema.sql` | Tables + RLS policies |
| `supabase/seed-admin.sql` | Link Auth user → admin |
| `lib/supabase/client.ts` | Browser Supabase client |
| `lib/supabase/server.ts` | Server Supabase client |
| `lib/supabase/database.types.ts` | TypeScript row types |

After you finish steps 1–7, say when you’re ready and we can replace the password-based admin login with **Supabase email login** and move forms/blog storage to the database.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `permission denied for table` | Re-run `schema.sql`; check RLS policies exist. |
| Admin login works in Supabase but app says unauthorized | User missing from `admin_profiles` — run `seed-admin.sql`. |
| `Invalid API key` | Wrong project URL/key pair; no extra spaces in `.env.local`. |
| Email link redirect fails | Add your URL to **Redirect URLs** in Auth settings. |
