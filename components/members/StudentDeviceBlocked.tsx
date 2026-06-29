"use client";

import { MonitorSmartphone } from "lucide-react";
import StudentGlassCard from "@/components/members/StudentGlassCard";
import StudentPortalButton from "@/components/members/StudentPortalButton";
import { createClient } from "@/lib/supabase/client";
import { accountLoginPath } from "@/lib/members/paths";
import { urlLocaleToInternal, type UrlLocale } from "@/lib/i18n/config";
import { toLocaleDigits } from "@/lib/i18n/digits";
import { localizedPath } from "@/lib/i18n/paths";

export interface StudentDeviceBlockedLabels {
  title: string;
  body: string;
  contactSupport: string;
  tryAgain: string;
  signOut: string;
}

interface StudentDeviceBlockedProps {
  locale: UrlLocale;
  cap: number;
  labels: StudentDeviceBlockedLabels;
}

export default function StudentDeviceBlocked({
  locale,
  cap,
  labels,
}: StudentDeviceBlockedProps) {
  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = accountLoginPath(locale);
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-5 px-4 pb-10 pt-6 sm:px-0 sm:pt-8">
      <StudentGlassCard className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-orange/30 bg-orange/10">
          <MonitorSmartphone
            className="h-6 w-6 text-orange"
            strokeWidth={1.75}
            aria-hidden
          />
        </div>
        <h1 className="mt-5 font-dm text-2xl font-semibold text-cream sm:text-3xl">
          {labels.title}
        </h1>
        <p className="mx-auto mt-4 max-w-lg font-dm text-sm leading-relaxed text-cream/65 sm:text-base">
          {labels.body.replace(
            "{cap}",
            toLocaleDigits(String(cap), urlLocaleToInternal(locale))
          )}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <StudentPortalButton
            href={`/api/members/device/retry?locale=${locale}`}
            variant="primary"
          >
            {labels.tryAgain}
          </StudentPortalButton>
          <StudentPortalButton
            href={localizedPath("/contact", locale)}
            variant="secondary"
          >
            {labels.contactSupport}
          </StudentPortalButton>
          <button
            type="button"
            onClick={() => void handleSignOut()}
            className="inline-flex items-center justify-center border border-white/[0.12] px-5 py-3 font-mono text-xs uppercase tracking-widest text-cream/80 transition-colors hover:border-orange/40 hover:text-orange"
          >
            {labels.signOut}
          </button>
        </div>
      </StudentGlassCard>
    </div>
  );
}
