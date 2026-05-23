"use client";

import { useLanguage } from "./context";
import { translations } from "./translations";

export function useTranslation() {
  const { lang } = useLanguage();
  return translations[lang];
}
