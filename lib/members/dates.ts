/** Parse YYYY-MM-DD from date input to start of local day (ISO). */
export function dateInputToStartIso(dateStr: string): string {
  if (!dateStr?.trim()) return startOfTodayIso();
  const [y, m, d] = dateStr.split("-").map(Number);
  if (!y || !m || !d) return startOfTodayIso();
  return new Date(y, m - 1, d, 0, 0, 0, 0).toISOString();
}

/** Parse YYYY-MM-DD to end of local day (ISO), for access end dates. */
export function dateInputToEndIso(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d, 23, 59, 59, 999).toISOString();
}

export function startOfTodayIso(): string {
  const now = new Date();
  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0,
    0
  ).toISOString();
}

export function todayDateInputValue(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function isoToDateInputValue(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatDateOnly(
  iso: string | null | undefined,
  locale: "en-GB" | "fa-IR" = "en-GB"
): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
