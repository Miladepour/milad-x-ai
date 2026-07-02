import type { UrlLocale } from "@/lib/i18n/config";
import { SITE_URL } from "@/lib/i18n/config";
import { localizedPath } from "@/lib/i18n/paths";
import type { LocaleCode } from "@/lib/supabase/database.types";

export function vipPassPath(locale: UrlLocale, token: string): string {
  return localizedPath(`/vip/${token}`, locale);
}

export function vipPassAbsoluteUrl(options: {
  locale: LocaleCode;
  token: string;
}): string {
  const urlLocale: UrlLocale = options.locale === "FA" ? "fa" : "en";
  return `${SITE_URL}${vipPassPath(urlLocale, options.token)}`;
}
