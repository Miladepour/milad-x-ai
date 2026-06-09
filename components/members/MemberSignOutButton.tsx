"use client";

import { createClient } from "@/lib/supabase/client";

export default function MemberSignOutButton({
  label,
  variant = "dark",
}: {
  label: string;
  variant?: "dark" | "sidebar";
}) {
  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  const className =
    variant === "sidebar"
      ? "w-full rounded-lg border border-surface px-3 py-2.5 text-left font-mono text-[10px] uppercase tracking-widest text-cream transition-colors hover:border-orange hover:text-orange"
      : "border border-surface px-4 py-2 font-mono text-xs uppercase tracking-widest text-cream hover:border-orange hover:text-orange";

  return (
    <button type="button" onClick={() => handleSignOut()} className={className}>
      {label}
    </button>
  );
}
