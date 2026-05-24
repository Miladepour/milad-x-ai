import type { Locale } from "./translations";

export const locales = ["en", "fa"] as const;
export type UrlLocale = (typeof locales)[number];

export const defaultLocale: UrlLocale = "en";

/** Only Farsi uses a visible URL prefix (`/fa`). English is unprefixed. */
export const localePrefix: UrlLocale = "fa";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://miladxai.com";

export function isValidLocale(value: string): value is UrlLocale {
  return locales.includes(value as UrlLocale);
}

/** Locale segment present in the browser URL (only `fa`, not `en`). */
export function isLocaleInPathname(segment: string): boolean {
  return segment === localePrefix;
}

export function urlLocaleToInternal(urlLocale: UrlLocale): Locale {
  return urlLocale === "fa" ? "FA" : "EN";
}

export function internalToUrlLocale(locale: Locale): UrlLocale {
  return locale === "FA" ? "fa" : "en";
}
