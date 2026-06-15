import { NextResponse } from "next/server";
import { isLinkedInPostingConfigured, getSiteUrl } from "@/lib/linkedin/config";
import {
  clearLinkedInOAuthState,
  readLinkedInOAuthState,
  setLinkedInAccessToken,
} from "@/lib/linkedin/cookies";
import { exchangeLinkedInAuthorizationCode } from "@/lib/linkedin/oauth";

export const dynamic = "force-dynamic";

function redirectWithError(message: string) {
  const target = new URL("/en/learn/certificates", getSiteUrl());
  target.searchParams.set("linkedinError", message);
  return NextResponse.redirect(target);
}

export async function GET(request: Request) {
  if (!isLinkedInPostingConfigured()) {
    return redirectWithError("not_configured");
  }

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error");

  const { state: savedState, returnTo } = readLinkedInOAuthState();
  clearLinkedInOAuthState();

  if (oauthError) {
    return redirectWithError(oauthError);
  }

  if (!code || !state || !savedState || state !== savedState) {
    return redirectWithError("invalid_state");
  }

  try {
    const token = await exchangeLinkedInAuthorizationCode(code);
    setLinkedInAccessToken(token.access_token, token.expires_in);

    const destination = new URL(returnTo || "/en/learn/certificates", getSiteUrl());
    destination.searchParams.set("linkedinPost", "1");
    return NextResponse.redirect(destination);
  } catch (error) {
    console.error("[linkedin/callback]", error);
    return redirectWithError("token_exchange_failed");
  }
}
