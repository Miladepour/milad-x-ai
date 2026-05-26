import type { User } from "@supabase/supabase-js";
import { createClient } from "./server";

/** Returns the signed-in user only if they exist in `admin_profiles`. */
export async function getAdminUser(): Promise<User | null> {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return null;

  const { data: profile, error: profileError } = await supabase
    .from("admin_profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile) return null;
  return user;
}
