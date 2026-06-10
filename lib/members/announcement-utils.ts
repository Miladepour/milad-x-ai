export function normalizeAnnouncementLink(
  url: string | null | undefined
): string | null {
  const trimmed = String(url ?? "").trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("/")) return trimmed;
  return `https://${trimmed}`;
}
