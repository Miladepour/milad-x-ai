import { cache } from "react";
import type { User } from "@supabase/supabase-js";
import { getAuthUser } from "./auth-user";
import { createClient } from "./server";
import { getStudentProfile } from "@/lib/members/store";
import type { StudentProfile } from "@/lib/members/types";

export interface StudentUser {
  user: User;
  profile: StudentProfile;
}

/** Returns the signed-in user only if they exist in `student_profiles`. */
export const getStudentUser = cache(async (): Promise<StudentUser | null> => {
  const supabase = createClient();
  const { user, error: userError } = await getAuthUser(supabase);

  if (userError || !user) return null;

  const profile = await getStudentProfile(user.id);
  if (!profile) return null;

  return { user, profile };
});
