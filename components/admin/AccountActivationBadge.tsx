"use client";

import { formatDateOnly } from "@/lib/members/dates";
import type { StudentProfile } from "@/lib/members/types";

export function AccountActivationBadge({ profile }: { profile: StudentProfile }) {
  if (profile.accountActivated) {
    return (
      <span
        className="inline-flex items-center rounded-full border border-emerald-400/40 bg-emerald-400/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-emerald-300"
        title={
          profile.accountActivatedAt
            ? `Activated ${formatDateOnly(profile.accountActivatedAt)}`
            : "Activated account"
        }
      >
        Activated account
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center rounded-full border border-red-400/40 bg-red-400/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-red-300"
      title="Invited but has not set a password yet"
    >
      Not activated
    </span>
  );
}
