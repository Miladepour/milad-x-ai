export type VipBadgeSize = "page" | "export-story" | "export-badge";

export interface VipBadgeSizeTokens {
  cardWidth: number;
  cardHeight: number;
  sceneWidth: number;
  strapHeight: number;
  taglinePx: number;
  rolePx: number;
  namePx: number;
  eventLabelPx: number;
  eventTitlePx: number;
  eventDatePx: number;
  logoHeight: number;
  cardRadius: number;
  tiltRotateX: number;
  tiltRotateY: number;
  holeTop: number;
  holeDiameter: number;
  claspHeight: number;
  badgeAttachOverlap: number;
  contentPaddingTop: number;
}

export const VIP_BADGE_SIZES: Record<VipBadgeSize, VipBadgeSizeTokens> = {
  page: {
    cardWidth: 280,
    cardHeight: 440,
    sceneWidth: 320,
    strapHeight: 175,
    taglinePx: 10,
    rolePx: 44,
    namePx: 24,
    eventLabelPx: 8,
    eventTitlePx: 12,
    eventDatePx: 11,
    logoHeight: 32,
    cardRadius: 22,
    tiltRotateX: 5,
    tiltRotateY: -3,
    holeTop: 12,
    holeDiameter: 18,
    claspHeight: 48,
    badgeAttachOverlap: 46,
    contentPaddingTop: 54,
  },
  "export-story": {
    cardWidth: 420,
    cardHeight: 660,
    sceneWidth: 480,
    strapHeight: 265,
    taglinePx: 14,
    rolePx: 62,
    namePx: 34,
    eventLabelPx: 11,
    eventTitlePx: 17,
    eventDatePx: 15,
    logoHeight: 48,
    cardRadius: 30,
    tiltRotateX: 4,
    tiltRotateY: -2,
    holeTop: 18,
    holeDiameter: 27,
    claspHeight: 72,
    badgeAttachOverlap: 68,
    contentPaddingTop: 74,
  },
  "export-badge": {
    cardWidth: 390,
    cardHeight: 612,
    sceneWidth: 440,
    strapHeight: 245,
    taglinePx: 13,
    rolePx: 58,
    namePx: 32,
    eventLabelPx: 10,
    eventTitlePx: 16,
    eventDatePx: 14,
    logoHeight: 44,
    cardRadius: 28,
    tiltRotateX: 4,
    tiltRotateY: -2,
    holeTop: 17,
    holeDiameter: 25,
    claspHeight: 66,
    badgeAttachOverlap: 62,
    contentPaddingTop: 68,
  },
};

export function getVipBadgeSizeTokens(size: VipBadgeSize): VipBadgeSizeTokens {
  return VIP_BADGE_SIZES[size];
}
