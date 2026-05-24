import { defaultLocale, isLocaleInPathname, type UrlLocale } from "./config";

/** Strip `/fa` (or legacy `/en`) from the start of a pathname. */
export function stripLocalePrefix(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length > 0 && isLocaleInPathname(segments[0])) {
    const rest = segments.slice(1).join("/");
    return rest ? `/${rest}` : "/";
  }
  if (segments.length > 0 && segments[0] === defaultLocale) {
    const rest = segments.slice(1).join("/");
    return rest ? `/${rest}` : "/";
  }
  return pathname || "/";
}

/**
 * Public URL for a logical path. English has no prefix; Farsi uses `/fa`.
 * `localizedPath("/contact", "fa")` → `/fa/contact`
 * `localizedPath("/contact", "en")` → `/contact`
 */
export function localizedPath(path: string, locale: UrlLocale): string {
  const hashIndex = path.indexOf("#");
  const hash = hashIndex >= 0 ? path.slice(hashIndex) : "";
  const pathOnly = hashIndex >= 0 ? path.slice(0, hashIndex) : path;

  const normalized =
    pathOnly === "/" || pathOnly === ""
      ? ""
      : pathOnly.startsWith("/")
        ? pathOnly
        : `/${pathOnly}`;

  if (locale === defaultLocale) {
    return `${normalized || "/"}${hash}`;
  }

  const base = normalized === "" ? `/${locale}` : `/${locale}${normalized}`;
  return `${base}${hash}`;
}

export function switchLocalePath(pathname: string, targetLocale: UrlLocale): string {
  return localizedPath(stripLocalePrefix(pathname), targetLocale);
}
