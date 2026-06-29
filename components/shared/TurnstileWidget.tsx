"use client";

import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import {
  getTurnstileSiteKey,
  localTurnstileHostnameHint,
} from "@/lib/security/turnstile-client";

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
    const [mounted, setMounted] = useState(false);
    const [error, setError] = useState("");
    const [hostnameHint, setHostnameHint] = useState<string | null>(null);

    useImperativeHandle(ref, () => ({
      reset: () => {
        setError("");
        turnstileRef.current?.reset();
      },
    }));

    useEffect(() => {
      setMounted(true);
      setHostnameHint(localTurnstileHostnameHint(window.location.hostname));
    }, []);

    if (!mounted) {
      return <div className={`min-h-[65px] ${className}`} aria-hidden />;
    }

    if (!siteKey) {
      if (process.env.NODE_ENV === "development") {
        return (
          <p className={`font-mono text-xs leading-relaxed text-orange ${className}`}>
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
