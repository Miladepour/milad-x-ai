import {
  getLinkedInClientId,
  getLinkedInClientSecret,
  getLinkedInRedirectUri,
  getSiteUrl,
} from "@/lib/linkedin/config";

const LINKEDIN_SCOPES = ["openid", "profile", "w_member_social"];

export function buildLinkedInAuthorizationUrl(state: string): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: getLinkedInClientId(),
    redirect_uri: getLinkedInRedirectUri(getSiteUrl()),
    state,
    scope: LINKEDIN_SCOPES.join(" "),
  });
  return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
}

export async function exchangeLinkedInAuthorizationCode(code: string): Promise<{
  access_token: string;
  expires_in: number;
}> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    client_id: getLinkedInClientId(),
    client_secret: getLinkedInClientSecret(),
    redirect_uri: getLinkedInRedirectUri(getSiteUrl()),
  });

  const response = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`LinkedIn token exchange failed: ${detail}`);
  }

  return response.json() as Promise<{ access_token: string; expires_in: number }>;
}
