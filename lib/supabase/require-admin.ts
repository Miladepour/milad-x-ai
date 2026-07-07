import type { User } from "@supabase/supabase-js";
import { getAuthUser } from "./auth-user";
import { createClient } from "./server";

/** Returns the signed-in user only if they exist in `admin_profiles`. */
export async function getAdminUser(): Promise<User | null> {
  const supabase = createClient();
  const { user, error: userError } = await getAuthUser(supabase);

  if (userError || !user) return null;

  const { data: profile, error: profileError } = await supabase
    .from("admin_profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile) return null;
  return user;
}
