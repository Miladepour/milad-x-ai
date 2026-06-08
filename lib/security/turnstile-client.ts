/** Public Turnstile site key (safe to expose in the browser). */
export function getTurnstileSiteKey(): string | undefined {
  return process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() || undefined;
}

export function isTurnstileSiteKeyConfigured(): boolean {
  return Boolean(getTurnstileSiteKey());
}

/** Hostnames Cloudflare Turnstile accepts when `localhost` is on the widget allowlist. */
export function isLocalTurnstileHost(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

export function localTurnstileHostnameHint(hostname: string): string | null {
  if (!isLocalTurnstileHost(hostname)) return null;
  if (hostname === "127.0.0.1") {
    return "Turnstile may not load on 127.0.0.1. Open http://localhost:3000 instead, or add 127.0.0.1 in Cloudflare Turnstile → Hostname Management.";
  }
  return null;
}
