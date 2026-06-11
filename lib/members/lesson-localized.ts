import type { LocaleCode } from "@/lib/supabase/database.types";
import type { ProgramLesson } from "./types";

export function resolveLessonTitle(lesson: ProgramLesson, locale: LocaleCode): string {
  if (locale === "FA") {
    return lesson.titleFa.trim() || lesson.titleEn.trim() || lesson.title.trim();
  }
  return lesson.titleEn.trim() || lesson.titleFa.trim() || lesson.title.trim();
}

export function resolveLessonBody(lesson: ProgramLesson, locale: LocaleCode): string {
  if (locale === "FA") {
    return lesson.bodyFa.trim() || lesson.bodyEn.trim() || lesson.description.trim();
  }
  return lesson.bodyEn.trim() || lesson.bodyFa.trim() || lesson.description.trim();
}
