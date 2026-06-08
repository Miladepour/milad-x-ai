/** Allow only same-origin relative paths (blocks open redirects). */
export function safeRedirectPath(next: string | null | undefined): string {
  if (!next || typeof next !== "string") return "/";

  const path = next.trim();
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) {
    return "/";
  }

  if (path.includes("@") || /^\/https?:/i.test(path)) {
    return "/";
  }

  return path;
}
