export type VipPassFormat = "story" | "badge";

export interface VipPassDimensions {
  width: number;
  height: number;
}

export const VIP_PASS_FORMATS: Record<VipPassFormat, VipPassDimensions> = {
  story: {
    width: 1080,
    height: 1920,
  },
  badge: {
    width: 1080,
    height: 1350,
  },
};

export function getVipPassElementId(format: VipPassFormat): string {
  return format === "story" ? "vip-pass-story" : "vip-pass-badge";
}

export function getVipPassDimensions(format: VipPassFormat): VipPassDimensions {
  return VIP_PASS_FORMATS[format];
}
