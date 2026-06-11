export type MembershipTier = "silver" | "gold" | "platinum";

export interface MembershipTierInfo {
  tier: MembershipTier;
  enrollmentCount: number;
  /** Progress toward the next tier (0–100). Platinum stays at 100. */
  progressPercent: number;
  coursesToNextTier: number | null;
  nextTier: MembershipTier | null;
}

export function getMembershipTier(enrollmentCount: number): MembershipTier {
  if (enrollmentCount >= 7) return "platinum";
  if (enrollmentCount >= 4) return "gold";
  return "silver";
}

export function getMembershipTierInfo(enrollmentCount: number): MembershipTierInfo {
  const count = Math.max(0, enrollmentCount);
  const tier = getMembershipTier(count);

  if (tier === "platinum") {
    return {
      tier,
      enrollmentCount: count,
      progressPercent: 100,
      coursesToNextTier: null,
      nextTier: null,
    };
  }

  if (tier === "gold") {
    const coursesToNextTier = 7 - count;
    const progressPercent =
      count >= 6 ? 95 : Math.round(((count - 3) / 3) * 100);
    return {
      tier,
      enrollmentCount: count,
      progressPercent: Math.min(Math.max(progressPercent, 0), 95),
      coursesToNextTier,
      nextTier: "platinum",
    };
  }

  const coursesToNextTier = Math.max(4 - count, 0);
  const progressPercent = count === 0 ? 0 : Math.round((count / 4) * 100);

  return {
    tier: "silver",
    enrollmentCount: count,
    progressPercent: Math.min(progressPercent, 75),
    coursesToNextTier: coursesToNextTier || null,
    nextTier: "gold",
  };
}

export const MEMBERSHIP_TIER_ORDER: MembershipTier[] = ["silver", "gold", "platinum"];

export function getMembershipDiscountPercent(tier: MembershipTier): number | null {
  if (tier === "gold") return 20;
  if (tier === "platinum") return 40;
  return null;
}
