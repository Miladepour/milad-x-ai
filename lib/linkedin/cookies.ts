import { cookies } from "next/headers";

const TOKEN_COOKIE = "linkedin_access_token";
const STATE_COOKIE = "linkedin_oauth_state";
const RETURN_COOKIE = "linkedin_oauth_return";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export function setLinkedInOAuthState(state: string, returnTo: string) {
  const store = cookies();
  store.set(STATE_COOKIE, state, { ...cookieOptions, maxAge: 600 });
  store.set(RETURN_COOKIE, returnTo, { ...cookieOptions, maxAge: 600 });
}

export function readLinkedInOAuthState(): {
  state: string | undefined;
  returnTo: string | undefined;
} {
  const store = cookies();
  return {
    state: store.get(STATE_COOKIE)?.value,
    returnTo: store.get(RETURN_COOKIE)?.value,
  };
}

export function clearLinkedInOAuthState() {
  const store = cookies();
  store.delete(STATE_COOKIE);
  store.delete(RETURN_COOKIE);
}

export function setLinkedInAccessToken(token: string, expiresIn: number) {
  cookies().set(TOKEN_COOKIE, token, {
    ...cookieOptions,
    maxAge: Math.max(300, expiresIn - 60),
  });
}

export function getLinkedInAccessToken(): string | undefined {
  return cookies().get(TOKEN_COOKIE)?.value;
}

export function clearLinkedInAccessToken() {
  cookies().delete(TOKEN_COOKIE);
}
