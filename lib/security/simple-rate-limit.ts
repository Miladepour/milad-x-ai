const buckets = new Map<string, number[]>();

const WINDOW_MS = 60 * 60 * 1000;
const MAX_REQUESTS = 5;

function prune(timestamps: number[], now: number): number[] {
  return timestamps.filter((ts) => now - ts < WINDOW_MS);
}

/** Best-effort in-memory limiter (per server instance). Pair with Supabase auth rate limits. */
export function isRateLimited(key: string): boolean {
  const now = Date.now();
  const current = prune(buckets.get(key) ?? [], now);
  if (current.length >= MAX_REQUESTS) {
    buckets.set(key, current);
    return true;
  }
  current.push(now);
  buckets.set(key, current);
  return false;
}

export function clientIpKey(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}
