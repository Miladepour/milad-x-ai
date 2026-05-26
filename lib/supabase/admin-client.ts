import { createClient, createServiceClient } from "./server";

/**
 * DB client for admin-only server code (after `getAdminUser()`).
 * Prefers service role so writes work even if course RLS policies are missing;
 * falls back to the session client when the service key is not configured.
 */
export function createAdminDbClient() {
  try {
    return createServiceClient();
  } catch {
    return createClient();
  }
}
