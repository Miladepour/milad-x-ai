/** Path prefixes that must never appear in the public sitemap. */
const PRIVATE_PATH_PREFIXES = [
  "/admin",
  "/api",
  "/auth",
] as const;

/** Reserved slugs that must not be exposed as public course/blog URLs in the sitemap. */
const RESERVED_SLUGS = new Set(["admin", "login", "auth", "api"]);

/** Logical site paths (no locale prefix) allowed in sitemap.xml. */
export const PUBLIC_SITEMAP_PATHS = [
  "/",
  "/contact",
  "/consultation",
  "/blog",
  "/courses",
  "/portfolio",
] as const;

export function getRobotsDisallowPaths(): string[] {
  const paths = ["/admin", "/api/", "/auth/"];
  const adminSegment = process.env.ADMIN_PATH_SEGMENT?.trim();
  if (adminSegment) {
    paths.push(`/${adminSegment}`);
    paths.push(`/${adminSegment}/`);
  }
  return paths;
}

export function isPrivateLogicalPath(logicalPath: string): boolean {
  const normalized = logicalPath.startsWith("/") ? logicalPath : `/${logicalPath}`;
  return PRIVATE_PATH_PREFIXES.some(
    (prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`)
  );
}

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.has(slug.trim().toLowerCase());
}

/** Returns false for admin, auth, api, and other non-public paths. */
export function shouldIncludeLogicalPathInSitemap(logicalPath: string): boolean {
  if (isPrivateLogicalPath(logicalPath)) return false;

  const segments = logicalPath.split("/").filter(Boolean);
  for (const segment of segments) {
    if (isReservedSlug(segment)) return false;
  }

  return true;
}
