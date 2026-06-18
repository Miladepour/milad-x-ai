import type { ErrorEvent, EventHint } from "@sentry/nextjs";

const SENSITIVE_PATH_RE =
  /\/(learn|api\/members|admin)(\/|$)/;

function getPathname(url: string | undefined): string {
  if (!url) return "";
  try {
    return url.startsWith("http") ? new URL(url).pathname : url;
  } catch {
    return url;
  }
}

export function isSensitiveSentryPath(url: string | undefined): boolean {
  return SENSITIVE_PATH_RE.test(getPathname(url));
}

export function scrubSentryEvent(event: ErrorEvent, _hint?: EventHint): ErrorEvent | null {
  const url = event.request?.url;

  if (isSensitiveSentryPath(url) && event.request) {
    delete event.request.data;
    delete event.request.cookies;

    if (event.request.headers) {
      delete event.request.headers.cookie;
      delete event.request.headers.authorization;
    }
  }

  if (event.user) {
    const id = event.user.id;
    event.user = id ? { id: String(id) } : {};
  }

  return event;
}

export function getSentryDsn(): string | undefined {
  return process.env.NEXT_PUBLIC_SENTRY_DSN?.trim() || undefined;
}

export function isSentryEnabled(): boolean {
  return Boolean(getSentryDsn());
}

export const sentryEnvironment =
  process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development";

export const sharedSentryOptions = {
  dsn: getSentryDsn(),
  enabled: isSentryEnabled(),
  environment: sentryEnvironment,
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
  sendDefaultPii: false,
  beforeSend: scrubSentryEvent,
} as const;
