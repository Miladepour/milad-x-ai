import type { SupabaseClient } from "@supabase/supabase-js";

/** Client-side: true only if the signed-in user has a row in admin_profiles. */
export async function isAdminProfile(supabase: SupabaseClient): Promise<boolean> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return false;

  const { data, error } = await supabase
    .from("admin_profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !data) return false;
  return true;
}

/** Signs out and throws if the current session is not an admin. */
export async function requireAdminProfileClient(
  supabase: SupabaseClient
): Promise<void> {
  const allowed = await isAdminProfile(supabase);
  if (!allowed) {
    await supabase.auth.signOut();
    throw new Error(
      "This account is not authorized for admin access. Use the student login page for enrolled programs."
    );
  }
}
