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

export function accountLoginPath(locale: UrlLocale): string {
  return localizedPath("/account/login", locale);
}

export function accountSetPasswordPath(locale: UrlLocale): string {
  return localizedPath("/account/set-password", locale);
}
