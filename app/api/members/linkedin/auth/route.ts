import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { isLinkedInPostingConfigured } from "@/lib/linkedin/config";
import { setLinkedInOAuthState } from "@/lib/linkedin/cookies";
import { buildLinkedInAuthorizationUrl } from "@/lib/linkedin/oauth";
import { getStudentUser } from "@/lib/supabase/require-student";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const student = await getStudentUser();
  if (!student) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isLinkedInPostingConfigured()) {
    return NextResponse.json(
      { error: "LinkedIn posting is not configured on this site." },
      { status: 503 }
    );
  }

  const url = new URL(request.url);
  const returnTo = url.searchParams.get("returnTo")?.trim() || "/en/learn/certificates";
  const state = randomUUID();

  setLinkedInOAuthState(state, returnTo);

  return NextResponse.redirect(buildLinkedInAuthorizationUrl(state));
}
