function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing ${name}`);
  }
  return value;
}

export function isLinkedInPostingConfigured(): boolean {
  return Boolean(
    process.env.LINKEDIN_CLIENT_ID?.trim() &&
      process.env.LINKEDIN_CLIENT_SECRET?.trim()
  );
}

export function getLinkedInClientId(): string {
  return requireEnv("LINKEDIN_CLIENT_ID");
}

export function getLinkedInClientSecret(): string {
  return requireEnv("LINKEDIN_CLIENT_SECRET");
}

export function getLinkedInApiVersion(): string {
  return process.env.LINKEDIN_API_VERSION?.trim() || "202601";
}

export function getLinkedInRedirectUri(siteUrl: string): string {
  const configured = process.env.LINKEDIN_REDIRECT_URI?.trim();
  if (configured) return configured;
  return `${siteUrl.replace(/\/$/, "")}/api/members/linkedin/callback`;
}

export function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "http://localhost:3000"
  );
}
