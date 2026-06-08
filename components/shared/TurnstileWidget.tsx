"use client";

import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { forwardRef, useImperativeHandle, useRef } from "react";

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
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();

    useImperativeHandle(ref, () => ({
      reset: () => {
        turnstileRef.current?.reset();
      },
    }));

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
          ref={turnstileRef}
          siteKey={siteKey}
          onSuccess={onToken}
          onExpire={() => {
            onExpire?.();
            turnstileRef.current?.reset();
          }}
          options={{ theme: "dark", size: "normal" }}
        />
      </div>
    );
  }
);

export default TurnstileWidget;
