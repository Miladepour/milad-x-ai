import type { SupabaseClient, User } from "@supabase/supabase-js";

/** Always validate with Supabase Auth — used on API routes and anywhere middleware did not refresh. */
export async function getAuthUser(
  supabase: SupabaseClient
): Promise<{ user: User | null; error: Error | null }> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  return { user: user ?? null, error: error ?? null };
}
