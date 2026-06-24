import { createAnonClient, createServiceClient } from "./server";

/**
 * Server-only client for public blog reads.
 * Uses service role when available (same pattern as course catalog) so posts
 * stay visible even if anon grants/RLS are misconfigured. Blog content is public.
 */
export function createBlogClient() {
  try {
    return createServiceClient();
  } catch {
    return createAnonClient();
  }
}
