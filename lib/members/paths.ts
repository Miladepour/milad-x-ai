import type { UrlLocale } from "@/lib/i18n/config";
import { localizedPath } from "@/lib/i18n/paths";

export function learnPath(locale: UrlLocale): string {
  return localizedPath("/learn", locale);
}

export function learnProgramPath(programSlug: string, locale: UrlLocale): string {
  return localizedPath(`/learn/${programSlug}`, locale);
}

export function learnLessonPath(
  programSlug: string,
  lessonId: string,
  locale: UrlLocale
): string {
  return localizedPath(`/learn/${programSlug}/${lessonId}`, locale);
}

/** Student login always uses the English URL; pass locale to return to that dashboard after sign-in. */
export function accountLoginPath(returnLocale: UrlLocale = "en"): string {
  const login = localizedPath("/account/login", "en");
  if (returnLocale === "en") {
    return login;
  }
  return `${login}?redirectTo=${encodeURIComponent(learnPath(returnLocale))}`;
}

export function accountSetPasswordPath(locale: UrlLocale): string {
  return localizedPath("/account/set-password", locale);
}

export function isSafeStudentRedirect(path: string): boolean {
  const allowed = [learnPath("en"), learnPath("fa")];
  return (
    allowed.includes(path) ||
    path.startsWith(`${learnPath("en")}/`) ||
    path.startsWith(`${learnPath("fa")}/`)
  );
}

export function resolveStudentLoginRedirect(
  redirectTo: string | undefined,
  fallbackLocale: UrlLocale
): string {
  if (redirectTo && isSafeStudentRedirect(redirectTo)) {
    return redirectTo;
  }
  return learnPath(fallbackLocale);
}
