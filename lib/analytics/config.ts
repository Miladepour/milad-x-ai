export function getGoogleAnalyticsId(): string | undefined {
  const id = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
  return id || undefined;
}

export function isGoogleAnalyticsEnabled(): boolean {
  return Boolean(getGoogleAnalyticsId());
}
