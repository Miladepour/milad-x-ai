import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createAnonClient } from "./server";

/**
 * Server-only client for public blog reads.
 * Uses service role when available (same pattern as course catalog) so posts
 * stay visible even if anon grants/RLS are misconfigured. Blog content is public.
 *
 * In development, fetches skip the Data Cache so CMS updates show immediately.
 * In production, use ISR-friendly revalidate so `generateStaticParams` / prerender
 * can succeed (plain `cache: "no-store"` breaks the Vercel static build).
 */
export function createBlogClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (url && serviceKey) {
    return createSupabaseClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init) =>
          fetch(input, {
            ...init,
            ...(process.env.NODE_ENV === "development"
              ? { cache: "no-store" as const }
              : { next: { revalidate: 3600 } }),
          }),
      },
    });
  }

  return createAnonClient();
}
