import type { LocaleCode } from "@/lib/supabase/database.types";
import type { MemberProgram } from "./types";

export function resolveProgramTitle(program: MemberProgram, locale: LocaleCode): string {
  if (locale === "FA") {
    return program.titleFa.trim() || program.titleEn.trim() || program.title.trim();
  }
  return program.titleEn.trim() || program.titleFa.trim() || program.title.trim();
}

export function resolveProgramDescription(
  program: MemberProgram,
  locale: LocaleCode
): string {
  if (locale === "FA") {
    return (
      program.descriptionFa.trim() ||
      program.descriptionEn.trim() ||
      program.description.trim()
    );
  }
  return (
    program.descriptionEn.trim() ||
    program.descriptionFa.trim() ||
    program.description.trim()
  );
}
