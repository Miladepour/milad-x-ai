import type { UrlLocale } from "@/lib/i18n/config";
import { SITE_URL } from "@/lib/i18n/config";
import { localizedPath } from "@/lib/i18n/paths";
import type { LocaleCode } from "@/lib/supabase/database.types";

export function reviewPath(locale: UrlLocale, programSlug?: string): string {
  if (programSlug) {
    return localizedPath(`/review/${programSlug}`, locale);
  }
  return localizedPath("/review", locale);
}

export function reviewAbsoluteUrl(options: {
  locale: LocaleCode;
  programSlug?: string;
}): string {
  const urlLocale: UrlLocale = options.locale === "FA" ? "fa" : "en";
  return `${SITE_URL}${reviewPath(urlLocale, options.programSlug)}`;
}
