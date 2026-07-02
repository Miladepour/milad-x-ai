import { isoToDateInputValue } from "./dates";

export type ExtendAccessMode = "days" | "date";

/** Add days to an existing end date, or from today when there is no end date. Returns YYYY-MM-DD. */
export function addDaysToEndDate(
  accessEndsAt: string | null | undefined,
  days: number
): string {
  const base = accessEndsAt ? new Date(accessEndsAt) : new Date();
  base.setDate(base.getDate() + days);
  return isoToDateInputValue(base.toISOString());
}

/** Resolve the new access end date (YYYY-MM-DD) from extend mode + inputs. */
export function computeExtendedEndDate(params: {
  mode: ExtendAccessMode;
  accessEndsAt: string | null | undefined;
  days?: number;
  endDate?: string;
}): string | null {
  if (params.mode === "date") {
    const raw = params.endDate?.trim();
    return raw || null;
  }
  const days = params.days ?? 0;
  if (!Number.isFinite(days) || days <= 0) return null;
  return addDaysToEndDate(params.accessEndsAt, days);
}

export function describeExtendChange(params: {
  mode: ExtendAccessMode;
  accessEndsAt: string | null | undefined;
  days?: number;
  endDate?: string;
}): { currentEndDate: string | null; newEndDate: string | null } {
  const currentEndDate = params.accessEndsAt
    ? isoToDateInputValue(params.accessEndsAt)
    : null;
  const newEndDate = computeExtendedEndDate(params);
  return { currentEndDate, newEndDate };
}
