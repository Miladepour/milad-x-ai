import { createServerClient } from "@supabase/ssr";
import { type NextRequest, type NextResponse } from "next/server";
import { getSupabaseEnv, isSupabaseConfigured } from "./env";

/** Refreshes the Supabase auth session and writes cookies onto the outgoing response. */
export async function updateSession(
  request: NextRequest,
  response: NextResponse
): Promise<NextResponse> {
  if (!isSupabaseConfigured()) return response;

  try {
    const { url, anonKey } = getSupabaseEnv();
    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    });

    await supabase.auth.getUser();
  } catch {
    // Invalid env or auth refresh failed — do not block the site
  }

  return response;
}
