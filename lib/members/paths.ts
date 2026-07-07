import type { UrlLocale } from "@/lib/i18n/config";
import { localizedPath } from "@/lib/i18n/paths";

export function learnPath(locale: UrlLocale): string {
  return localizedPath("/learn", locale);
}

export function learnAnnouncementsPath(locale: UrlLocale): string {
  return localizedPath("/learn/announcements", locale);
}

export function learnProgramsPath(locale: UrlLocale): string {
  return localizedPath("/learn/programs", locale);
}

export function learnCertificatesPath(locale: UrlLocale): string {
  return localizedPath("/learn/certificates", locale);
}

export function learnUpcomingCoursesPath(locale: UrlLocale): string {
  return localizedPath("/learn/upcoming-courses", locale);
}

export function learnResourcesPath(locale: UrlLocale): string {
  return localizedPath("/learn/resources", locale);
}

export function learnProfilePath(locale: UrlLocale): string {
  return localizedPath("/learn/profile", locale);
}

export function learnClubCardPath(locale: UrlLocale): string {
  return localizedPath("/learn/club-card", locale);
}

export function learnSupportPath(locale: UrlLocale): string {
  return localizedPath("/learn/support", locale);
}

export function learnBonusProgramsPath(locale: UrlLocale): string {
  return localizedPath("/learn/bonus", locale);
}

export function learnBonusProgramPath(programSlug: string, locale: UrlLocale): string {
  return localizedPath(`/learn/bonus/${programSlug}`, locale);
}

export function learnBonusLessonPath(
  programSlug: string,
  lessonId: string,
  locale: UrlLocale
): string {
  return localizedPath(`/learn/bonus/${programSlug}/${lessonId}`, locale);
}

export function learnProgramPath(programSlug: string, locale: UrlLocale): string {
  return localizedPath(`/learn/${programSlug}`, locale);
}

export function learnProgramCertificatePath(
  programSlug: string,
  locale: UrlLocale
): string {
  return localizedPath(`/learn/${programSlug}/certificate`, locale);
}

export function certificateVerifyPath(
  certificateNumber: string,
  locale: UrlLocale
): string {
  return localizedPath(
    `/certificates/verify/${encodeURIComponent(certificateNumber)}`,
    locale
  );
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

export function accountForgotPasswordPath(): string {
  return localizedPath("/account/forgot-password", "en");
}

export function accountDeviceBlockedPath(locale: UrlLocale): string {
  return localizedPath("/account/device-blocked", locale);
}

/** Register this browser before entering the student portal. */
export function studentDeviceBootstrapUrl(
  redirectTo: string,
  locale?: UrlLocale
): string {
  const bootstrapLocale =
    locale ?? (redirectTo.startsWith("/fa/") ? "fa" : "en");
  const params = new URLSearchParams({
    locale: bootstrapLocale,
    next: redirectTo,
  });
  return `/api/members/device/bootstrap?${params.toString()}`;
}

export function isSafeStudentRedirect(path: string): boolean {
  const allowed = [learnPath("en"), learnPath("fa")];
  return (
    allowed.includes(path) ||
    path.startsWith(`${learnPath("en")}/`) ||
    path.startsWith(`${learnPath("fa")}/`)
  );
}

export function isSafeBonusStudentRedirect(path: string): boolean {
  return (
    path.startsWith(`${learnPath("en")}/bonus`) ||
    path.startsWith(`${learnPath("fa")}/bonus`)
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
