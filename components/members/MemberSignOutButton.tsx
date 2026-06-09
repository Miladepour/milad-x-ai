"use client";

import { createClient } from "@/lib/supabase/client";

export default function MemberSignOutButton({ label }: { label: string }) {
  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <button
      type="button"
      onClick={() => handleSignOut()}
      className="border border-surface px-4 py-2 font-mono text-xs uppercase tracking-widest text-cream hover:border-orange hover:text-orange"
    >
      {label}
    </button>
  );
}
