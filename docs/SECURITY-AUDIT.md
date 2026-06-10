# Security Audit — milad-x-ai

**Audited:** 2026-06-10  
**Stack:** Next.js 14, Supabase (Postgres + Auth), Cloudflare Turnstile, Resend  
**Auditor:** Claude Code (zero-trust review, all API routes, SQL schemas, git history, env files)

**Overall verdict:** Solid foundation — no frontend secret leaks, no global-state cross-contamination, properly signed webhooks. One genuine cross-user data exposure and two hardening gaps need fixing.

---

## Findings Summary

| # | Severity | Title | Status |
|---|----------|-------|--------|
| 1 | 🔴 HIGH | `student_announcements` RLS has no audience enforcement | Open |
| 2 | 🟡 MEDIUM | `lesson_progress` write policy has no enrollment check | Open |
| 3 | 🟡 MEDIUM | `GRANT ALL` to `authenticated` on most tables | Open |
| 4 | 🟡 MEDIUM | CSP allows `unsafe-inline` + `unsafe-eval` for scripts | Open |
| 5 | 🟢 LOW | Raw Postgres error messages returned to API clients | Open |
| 6 | 🟢 LOW | No app-level rate limiting on authenticated endpoints | Open |
| 7 | 🟢 LOW | Stale PII file `data/waitlist-submissions.json` on disk | Open |
| 8 | 🟢 LOW | Duplicate Turnstile env vars in `.env.local` | Open |

Areas confirmed clean (no action needed):

- **Frontend secret leaks:** Zero. Service role key, Turnstile secret, Resend key are server-only. Git history clean.
- **Global-state cross-contamination:** Zero. Every request gets a fresh, cookie-scoped Supabase client. No module-level mutable session state.
- **Webhook caller identity:** Resend webhook uses Svix HMAC-SHA256 with timing-safe comparison and a 5-minute timestamp window.
- **Admin authentication:** All admin routes gate on session + `admin_profiles` row + optional TOTP MFA before touching data.
- **Open redirect:** Auth callback sanitised by `safeRedirectPath` (blocks `//`, `\`, `@`, `https:` prefix).
- **XSS:** Blog, lesson, and email HTML all pass through `sanitize-html` before `dangerouslySetInnerHTML`.

---

## Finding 1 — 🔴 HIGH: `student_announcements` RLS has no audience enforcement

### What is happening

`patch-student-announcements.sql` created the student read policy:

```sql
create policy "Students read published announcements"
  on public.student_announcements for select to authenticated
  using (
    is_student()
    and published_at is not null
    and published_at <= now()
    and (expires_at is null or expires_at > now())
  );
```

Later, `patch-student-announcement-audience.sql` added `audience_type`, `student_id`, and `program_ids` columns — but **never updated this policy**.

### Impact

The Supabase URL and anon key are intentionally public. Any enrolled student can use their session JWT to query the REST API directly:

```
GET https://<project>.supabase.co/rest/v1/student_announcements?select=*
Authorization: Bearer <student-jwt>
```

This returns **every published announcement** — including ones addressed to a single other student (`audience_type = 'student'`) or a specific program the requester is not enrolled in. An announcement like "Your payment failed" or "Your access expires on X" reveals the target student's `student_id` UUID, name reference, and private content.

App-side filtering in `lib/members/store.ts` (`announcementMatchesStudent`) is not a security boundary — it is bypassed entirely by a direct API call.

### Fix

Create a SQL patch (e.g. `supabase/patch-announcements-rls-fix.sql`) and run it in the Supabase SQL editor:

```sql
-- Fix: enforce audience targeting at the database layer.

drop policy if exists "Students read published announcements" on public.student_announcements;

create policy "Students read published announcements"
  on public.student_announcements for select to authenticated
  using (
    public.is_student()
    and published_at is not null
    and published_at <= now()
    and (expires_at is null or expires_at > now())
    and (
      -- broadcast to all students
      audience_type = 'all'
      -- targeted to this specific student
      or (audience_type = 'student' and student_id = auth.uid())
      -- targeted to a program this student is actively enrolled in
      or (
        audience_type = 'programs'
        and exists (
          select 1
          from public.program_enrollments e
          where e.student_id = auth.uid()
            and e.program_id = any(program_ids)
            and public.is_enrollment_active(e.status, e.access_starts_at, e.access_ends_at)
        )
      )
    )
  );
```

### Files involved

- `supabase/patch-student-announcements.sql` — original (vulnerable) policy
- `supabase/patch-student-announcement-audience.sql` — added columns, missed updating policy
- `lib/members/store.ts` — `listAnnouncementsForStudent` (app-layer filter, not sufficient alone)
- `app/api/members/announcements/route.ts` — student-facing announcement endpoint

---

## Finding 2 — 🟡 MEDIUM: `lesson_progress` write policy has no enrollment check

### What is happening

`schema-member-portal.sql` creates:

```sql
create policy "Students manage own progress"
  on public.lesson_progress for all to authenticated
  using (student_id = auth.uid())
  with check (student_id = auth.uid());
```

The `with check` only confirms the row belongs to the authenticated student — it does not verify the student is enrolled in the program that owns `lesson_id`.

### Impact

A student can fabricate `lesson_progress` rows for any `lesson_id` UUID — even lessons from programs they are not enrolled in and cannot access. This corrupts admin analytics (completion rates, engagement reports) without giving the attacker access to lesson content. Attackers need a valid UUID to target, but lesson UUIDs can be observed from any enrolled program and tried against others.

### Fix

```sql
-- supabase/patch-lesson-progress-rls-fix.sql

drop policy if exists "Students manage own progress" on public.lesson_progress;

create policy "Students manage own progress"
  on public.lesson_progress for all to authenticated
  using (student_id = auth.uid())
  with check (
    student_id = auth.uid()
    and public.has_program_access(
      (select program_id from public.program_lessons where id = lesson_id)
    )
  );
```

### Files involved

- `supabase/schema-member-portal.sql` — source of the policy
- `app/api/members/progress/route.ts` — accepts any `lessonId` from the request body without enrollment check

---

## Finding 3 — 🟡 MEDIUM: `GRANT ALL` to `authenticated` on most tables

### What is happening

`schema.sql` and `schema-member-portal.sql` grant `ALL` (select, insert, update, delete) to `authenticated` on most tables, relying entirely on RLS to restrict operations. For example:

```sql
-- schema-member-portal.sql
grant all on public.member_programs to authenticated;
grant all on public.program_lessons to authenticated;
grant all on public.student_profiles to authenticated;
grant all on public.program_enrollments to authenticated;
grant all on public.lesson_progress to authenticated;
```

### Impact

Not exploitable today because RLS policies are properly defined and enabled. However:

- A single future `create policy ... using (true)` mistake on any of these tables gives every authenticated user full write access.
- Accidentally disabling `row security` on a table (e.g. during a schema migration) exposes all rows with no privilege safety net.
- Grant-level protection is an independent, low-cost defense layer that currently does not exist.

### Fix

Tighten grants to only the verbs each role actually needs:

```sql
-- Students should never delete programs, lessons, or enrollments
revoke delete on public.member_programs from authenticated;
revoke insert, update, delete on public.program_lessons from authenticated;
revoke insert, delete on public.program_enrollments from authenticated;
revoke delete on public.student_profiles from authenticated;

-- Blog/course content — students only need to read
revoke insert, update, delete on public.blog_posts from authenticated; -- admins use service role
```

Adjust the specifics based on which operations your app code actually performs under the session client vs. the service-role client.

---

## Finding 4 — 🟡 MEDIUM: CSP allows `unsafe-inline` and `unsafe-eval` for scripts

### What is happening

`next.config.mjs` sets:

```js
"script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com",
```

### Impact

`unsafe-inline` means any inline `<script>` tag injected by an attacker (e.g. through a stored XSS payload that escapes a sanitizer) can execute. `unsafe-eval` means `eval()`, `setTimeout("string")`, and `new Function()` are permitted. CSP provides no XSS mitigation while these directives are present.

The sanitizers (`sanitize-html`) are solid and currently provide the real protection, but CSP as a second layer of defence is completely bypassed.

### Fix

The correct approach for Next.js is to use **nonce-based CSP**, which Next.js supports via middleware. This is a moderate refactor — it requires generating a per-request nonce and threading it through `<Script>` components. The minimal quick win is to remove `unsafe-eval` (Next.js does not require it in production builds):

```js
// next.config.mjs — remove unsafe-eval, keep unsafe-inline for now
"script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com",
```

Full nonce-based CSP is documented at [nextjs.org/docs/app/building-your-application/configuring/content-security-policy](https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy).

### Files involved

- `next.config.mjs:43`

---

## Finding 5 — 🟢 LOW: Raw Postgres error messages returned to API clients

### What is happening

Catch blocks in admin and webhook routes return `error.message` directly:

```ts
// app/api/admin-console/route.ts
const message = error instanceof Error ? error.message : "Server error";
return NextResponse.json({ error: message }, { status: 500 });
```

A Postgres or Supabase error message can contain schema names, table names, column names, constraint names, and query fragments.

### Impact

Low — admin routes are gated behind auth, so an attacker would need a valid admin session to see these. The Resend webhook echoes errors too (`app/api/webhooks/resend/route.ts:69`). Minor information disclosure useful for reconnaissance.

### Fix

Log the full error server-side and return a generic message to the client:

```ts
} catch (error) {
  console.error("[admin-console]", error);
  return NextResponse.json({ error: "Server error" }, { status: 500 });
}
```

The public form routes (`/api/contact`, `/api/waitlist`) already do this correctly with `FORM_ERROR_MESSAGE`.

### Files involved

- `app/api/admin-console/route.ts:196-198`
- `app/api/admin-members/route.ts:501-503`
- `app/api/webhooks/resend/route.ts:69-71`

---

## Finding 6 — 🟢 LOW: No app-level rate limiting on authenticated endpoints

### What is happening

There is no per-user request throttle on authenticated routes. Supabase Auth throttles login attempts, and Turnstile + RLS cover the public forms. But once a student is authenticated, they can hammer:

- `/api/members/progress` — write a progress row on every request
- `/api/members/announcements` — read + mark-read in a loop
- `/api/notifications` — list/mark-read repeatedly

An admin can spam `/api/admin-members` actions including `send-student-email`.

### Impact

Low at current scale. The `send-student-email` action is the highest concern — a compromised admin account or browser automation could trigger bulk Resend sends. No denial-of-service risk to other users, but could incur Resend costs or trigger Resend's abuse detection.

### Fix

Add a rate limiter to the email-sending and progress-write routes. The cheapest option for a Vercel/Next.js stack is [Upstash Ratelimit](https://github.com/upstash/ratelimit):

```ts
// Example: 10 progress updates per minute per user
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 m"),
});
```

Alternatively, Vercel's built-in [Edge Middleware rate limiting](https://vercel.com/docs/security/rate-limiting) can gate entire route patterns.

---

## Finding 7 — 🟢 LOW: Stale PII file `data/waitlist-submissions.json` on disk

### What is happening

`data/waitlist-submissions.json` is present on disk, untracked by git (properly gitignored). It is a relic from the pre-Supabase era when submissions were stored as JSON files.

### Impact

The file contains real user submissions (names, emails, mobile numbers, country). If the project directory is ever copied, backed up to cloud storage, or shared, this PII travels with it silently.

### Fix

Delete it:

```bash
rm data/waitlist-submissions.json
```

Verify submissions are fully migrated to Supabase (`waitlist_submissions` table) before deleting.

---

## Finding 8 — 🟢 LOW: Duplicate Turnstile env vars in `.env.local`

### What is happening

`.env.local` contains the Turnstile keys twice (lines 5–6 and 7–8). The second pair silently overrides the first.

### Fix

Remove the duplicate pair, keeping only one occurrence of each:

```
NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAAADg5dJavpUPl7CuZ
TURNSTILE_SECRET_KEY=0x4AAAAAADg5dJMMzzBN7SwSLPGTpie4Yig
```

---

## Recommended Fix Order

1. **Finding 1** — run the `student_announcements` RLS patch immediately. This is the only finding that currently exposes one user's data to another.
2. **Finding 2** — run the `lesson_progress` enrollment check patch.
3. **Finding 7** — delete the stale PII file.
4. **Finding 8** — deduplicate `.env.local`.
5. **Finding 5** — tighten error responses in catch blocks.
6. **Finding 3** — tighten table grants (do during next schema migration).
7. **Finding 4** — remove `unsafe-eval` now; plan nonce-based CSP for later.
8. **Finding 6** — add rate limiting when traffic warrants it.
