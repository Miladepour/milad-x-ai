"use client";

import { TELEGRAM_APPLY_URL } from "@/lib/courses/constants";
import type { Locale } from "@/lib/i18n/translations";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface CourseIranTelegramNoteProps {
  lang: Locale;
  className?: string;
}

/** Iran participants register via Telegram instead of a separate Toman price. */
export default function CourseIranTelegramNote({
  lang: _lang,
  className = "",
}: CourseIranTelegramNoteProps) {
  const p = useTranslation().coursesPage;

  return (
    <p className={`font-dm text-xs text-cream/65 leading-relaxed ${className}`.trim()}>
      {p.iranJoinHint}{" "}
      <a
        href={TELEGRAM_APPLY_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="text-orange underline underline-offset-2 hover:text-cream transition-colors"
      >
        {p.iranJoinTelegram}
      </a>
    </p>
  );
}
