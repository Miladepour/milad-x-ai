import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createAnonClient } from "./server";

/**
 * Server-only client for public blog reads.
 * Uses service role when available (same pattern as course catalog) so posts
 * stay visible even if anon grants/RLS are misconfigured. Blog content is public.
 *
 * `cache: "no-store"` avoids Next.js Data Cache serving stale posts after CMS
 * updates (important for local testing and immediate publish visibility).
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
            cache: "no-store",
          }),
      },
    });
  }

  return createAnonClient();
}
