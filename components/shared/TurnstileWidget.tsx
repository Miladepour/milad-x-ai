"use client";

import dynamic from "next/dynamic";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import type { TurnstileInstance } from "@marsidev/react-turnstile";
import {
  getTurnstileSiteKey,
  localTurnstileHostnameHint,
} from "@/lib/security/turnstile-client";

const Turnstile = dynamic(
  () => import("@marsidev/react-turnstile").then((mod) => mod.Turnstile),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[65px] items-center">
        <p className="font-mono text-xs text-cream/50">Loading security check…</p>
      </div>
    ),
  }
);

export interface TurnstileWidgetHandle {
  reset: () => void;
}

interface TurnstileWidgetProps {
  onToken: (token: string) => void;
  onExpire?: () => void;
  className?: string;
}

const TurnstileWidget = forwardRef<TurnstileWidgetHandle, TurnstileWidgetProps>(
  function TurnstileWidget({ onToken, onExpire, className = "" }, ref) {
    const turnstileRef = useRef<TurnstileInstance>(null);
    const siteKey = getTurnstileSiteKey();
    const [error, setError] = useState("");
    const [hostnameHint, setHostnameHint] = useState<string | null>(null);

    useImperativeHandle(ref, () => ({
      reset: () => {
        setError("");
        turnstileRef.current?.reset();
      },
    }));

    useEffect(() => {
      if (typeof window === "undefined") return;
      setHostnameHint(localTurnstileHostnameHint(window.location.hostname));
    }, []);

    if (!siteKey) {
      if (process.env.NODE_ENV === "development") {
        return (
          <p className="font-mono text-xs leading-relaxed text-orange">
            Turnstile not loaded. Add NEXT_PUBLIC_TURNSTILE_SITE_KEY to .env.local, save the
            file, then restart the dev server (Ctrl+C → npm run dev).
          </p>
        );
      }
      return null;
    }

    return (
      <div className={className}>
        <div className="min-h-[65px]">
          <Turnstile
            ref={turnstileRef}
            siteKey={siteKey}
            onSuccess={(token) => {
              setError("");
              onToken(token);
            }}
            onExpire={() => {
              onExpire?.();
              turnstileRef.current?.reset();
            }}
            onError={() => {
              setError(
                "Security check failed to load. Try http://localhost (not 127.0.0.1), disable ad blockers, or confirm the hostname is allowed in Cloudflare Turnstile."
              );
              onExpire?.();
            }}
            onUnsupported={() => {
              setError("This browser cannot run the security check.");
            }}
            options={{ theme: "dark", size: "normal" }}
          />
        </div>
        {hostnameHint && !error && (
          <p className="mt-2 font-dm text-xs leading-relaxed text-cream/50">{hostnameHint}</p>
        )}
        {error && (
          <p className="mt-2 font-dm text-xs leading-relaxed text-orange">{error}</p>
        )}
      </div>
    );
  }
);

export default TurnstileWidget;
