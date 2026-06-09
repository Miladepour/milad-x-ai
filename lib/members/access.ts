import type { EnrollmentStatus, ProgramEnrollment } from "./types";

export function isEnrollmentActive(enrollment: Pick<
  ProgramEnrollment,
  "status" | "accessStartsAt" | "accessEndsAt"
>): boolean {
  if (enrollment.status === "suspended" || enrollment.status === "expired") {
    return false;
  }
  const now = Date.now();
  const starts = new Date(enrollment.accessStartsAt).getTime();
  if (now < starts) return false;
  if (enrollment.accessEndsAt) {
    const ends = new Date(enrollment.accessEndsAt).getTime();
    if (now > ends) return false;
  }
  return enrollment.status === "invited" || enrollment.status === "active";
}

export function resolveEnrollmentStatus(
  enrollment: Pick<ProgramEnrollment, "status" | "accessStartsAt" | "accessEndsAt">
): EnrollmentStatus {
  if (enrollment.status === "suspended") return "suspended";
  const now = Date.now();
  if (enrollment.accessEndsAt && now > new Date(enrollment.accessEndsAt).getTime()) {
    return "expired";
  }
  if (now < new Date(enrollment.accessStartsAt).getTime()) {
    return enrollment.status === "invited" ? "invited" : "active";
  }
  if (enrollment.status === "invited") return "active";
  return enrollment.status;
}

export function computeProgressPercent(
  completedCount: number,
  totalCount: number
): number {
  if (totalCount <= 0) return 0;
  return Math.round((completedCount / totalCount) * 100);
}
