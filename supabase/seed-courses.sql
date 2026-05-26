-- Seed courses: run AFTER schema.sql
-- Option A: In admin → Courses → "Import from codebase" (recommended; loads EN/FA from lib/courses/data)
-- Option B: Run scripts/seed-courses.mjs locally (requires .env.local with Supabase keys)

-- Verify tables exist:
-- select slug, published_at from public.courses;
