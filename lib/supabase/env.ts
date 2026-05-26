/** Supabase project URL, e.g. https://abcdefgh.supabase.co (not an API key). */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";

  if (!url.startsWith("https://") || !url.includes(".supabase.co")) {
    return false;
  }

  // Reject common copy-paste mistakes (publishable keys, JWT in URL field, etc.)
  if (
    url.includes("sb_publishable") ||
    url.includes("eyJ") ||
    url.includes(" ")
  ) {
    return false;
  }

  return anonKey.startsWith("eyJ");
}

export function getSupabaseEnv() {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Set NEXT_PUBLIC_SUPABASE_URL to your project URL (https://xxxx.supabase.co) and NEXT_PUBLIC_SUPABASE_ANON_KEY to the anon public key from Supabase → Settings → API."
    );
  }

  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!.trim(),
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim(),
  };
}
