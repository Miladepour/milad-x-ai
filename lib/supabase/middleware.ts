import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv, isSupabaseConfigured } from "./env";

function copyCookies(from: NextResponse, to: NextResponse): NextResponse {
  from.cookies.getAll().forEach(({ name, value }) => {
    to.cookies.set(name, value);
  });
  return to;
}

/**
 * Refreshes the Supabase session and writes cookies onto the outgoing response.
 * Uses the @supabase/ssr pattern that recreates the response in setAll so cookies
 * persist correctly with Next.js rewrites and redirects.
 */
export async function updateSession(
  request: NextRequest,
  routingResponse: NextResponse
): Promise<NextResponse> {
  if (!isSupabaseConfigured()) return routingResponse;

  try {
    const { url, anonKey } = getSupabaseEnv();
    let sessionResponse = NextResponse.next({ request });

    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          sessionResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            sessionResponse.cookies.set(name, value, options);
          });
        },
      },
    });

    await supabase.auth.getUser();

    if (
      routingResponse.headers.get("x-middleware-rewrite") ||
      routingResponse.headers.get("location") ||
      routingResponse.status !== 200
    ) {
      return copyCookies(sessionResponse, routingResponse);
    }

    return sessionResponse;
  } catch {
    return routingResponse;
  }
}
