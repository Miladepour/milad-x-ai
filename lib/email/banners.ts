import { SITE_URL } from "@/lib/i18n/config";

export const EMAIL_BANNER_IDS = [
  "invite",
  "welcome",
  "access-reminder",
  "announcement",
  "workshop",
  "tutorials",
  "automation",
  "general",
] as const;

export type EmailBannerId = (typeof EMAIL_BANNER_IDS)[number];

export interface EmailBannerOption {
  id: EmailBannerId;
  label: string;
  /** Relative path under /public */
  imagePath: string;
}

export const EMAIL_BANNERS: Record<EmailBannerId, EmailBannerOption> = {
  invite: {
    id: "invite",
    label: "Invite — key & portal",
    imagePath: "/images/email-banners/invite.png",
  },
  welcome: {
    id: "welcome",
    label: "Welcome — wave hello",
    imagePath: "/images/email-banners/welcome.png",
  },
  "access-reminder": {
    id: "access-reminder",
    label: "Access reminder — calendar",
    imagePath: "/images/email-banners/access-reminder.png",
  },
  announcement: {
    id: "announcement",
    label: "Announcement — megaphone",
    imagePath: "/images/email-banners/announcement.png",
  },
  workshop: {
    id: "workshop",
    label: "Workshop — live session",
    imagePath: "/images/email-banners/workshop.png",
  },
  tutorials: {
    id: "tutorials",
    label: "Tutorials — play & learn",
    imagePath: "/images/email-banners/tutorials.png",
  },
  automation: {
    id: "automation",
    label: "Automation — workflow",
    imagePath: "/images/email-banners/automation.png",
  },
  general: {
    id: "general",
    label: "General — academy",
    imagePath: "/images/email-banners/general.png",
  },
};

export const EMAIL_BANNER_LIST: EmailBannerOption[] = EMAIL_BANNER_IDS.map(
  (id) => EMAIL_BANNERS[id]
);

export const DEFAULT_BROADCAST_BANNER_ID: EmailBannerId = "announcement";

function absoluteAsset(path: string): string {
  const base = SITE_URL.replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function getEmailBannerImageUrl(bannerId: EmailBannerId): string {
  return absoluteAsset(EMAIL_BANNERS[bannerId].imagePath);
}

export function parseEmailBannerId(value: unknown): EmailBannerId {
  if (typeof value === "string" && EMAIL_BANNER_IDS.includes(value as EmailBannerId)) {
    return value as EmailBannerId;
  }
  return DEFAULT_BROADCAST_BANNER_ID;
}
