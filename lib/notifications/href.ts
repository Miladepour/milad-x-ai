import { learnAnnouncementsPath } from "@/lib/members/paths";
import type { UrlLocale } from "@/lib/i18n/config";
import type { AppNotification } from "@/lib/notifications/types";

export function resolveNotificationHref(
  notification: AppNotification,
  locale: UrlLocale
): string | null {
  if (notification.kind === "announcement") {
    return learnAnnouncementsPath(locale);
  }

  if (notification.href?.includes("#announcements")) {
    return learnAnnouncementsPath(locale);
  }

  return notification.href;
}
