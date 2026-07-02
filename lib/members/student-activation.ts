import type { User } from "@supabase/supabase-js";

export function resolveStudentAccountActivation(user: User | null | undefined): {
  accountActivated: boolean;
  accountActivatedAt: string | null;
} {
  if (!user) {
    return { accountActivated: false, accountActivatedAt: null };
  }

  const passwordSetAt = user.user_metadata?.password_set_at;
  const activatedAt =
    (typeof passwordSetAt === "string" && passwordSetAt.trim()) ||
    user.last_sign_in_at ||
    null;

  return {
    accountActivated: Boolean(activatedAt),
    accountActivatedAt: activatedAt,
  };
}

export const STUDENT_PASSWORD_SET_METADATA_KEY = "password_set_at";
