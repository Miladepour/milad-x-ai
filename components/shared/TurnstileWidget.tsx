"use client";

import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { useRef } from "react";

interface TurnstileWidgetProps {
  onToken: (token: string) => void;
  onExpire?: () => void;
  className?: string;
}

export default function TurnstileWidget({
  onToken,
  onExpire,
  className = "",
}: TurnstileWidgetProps) {
  const ref = useRef<TurnstileInstance>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();

  if (!siteKey) {
    if (process.env.NODE_ENV === "development") {
      return (
        <p className="font-mono text-xs text-muted/70" aria-hidden>
          Turnstile disabled (no site key in dev)
        </p>
      );
    }
    return null;
  }

  return (
    <div className={className}>
      <Turnstile
        ref={ref}
        siteKey={siteKey}
        onSuccess={onToken}
        onExpire={() => {
          onExpire?.();
          ref.current?.reset();
        }}
        options={{ theme: "dark", size: "normal" }}
      />
    </div>
  );
}
