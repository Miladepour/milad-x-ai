import { createAnonClient, createServiceClient } from "./server";

/**
 * Server-only client for public course catalog reads.
 * Uses service role when available (bypasses RLS) but every query must filter
 * `published_at IS NOT NULL` so drafts never leak. Falls back to anon if no service key.
 */
export function createCatalogClient() {
  try {
    return createServiceClient();
  } catch {
    return createAnonClient();
  }
}
