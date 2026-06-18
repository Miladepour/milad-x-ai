"use client";

import { useEffect, useState } from "react";

/** Hidden unless URL has ?sentryTest=1 — remove after verifying production Sentry. */
export default function SentryTestTrigger() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setVisible(params.get("sentryTest") === "1");
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => {
        throw new Error("Sentry production test — MX AI Academy");
      }}
      className="fixed bottom-4 right-4 z-[9999] border-2 border-orange bg-background px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-orange shadow-lg"
    >
      Test Sentry
    </button>
  );
}
