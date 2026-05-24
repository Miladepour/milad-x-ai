"use client";

import { createContext, useCallback, useContext, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  internalToUrlLocale,
  urlLocaleToInternal,
  type UrlLocale,
} from "./config";
import { localizedPath, switchLocalePath } from "./paths";
import type { Locale } from "./translations";

interface LanguageContextValue {
  lang: Locale;
  urlLocale: UrlLocale;
  setLang: (lang: Locale) => void;
  /** Prefix a logical path with the current locale, e.g. `/contact` → `/en/contact` */
  href: (path: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({
  children,
  urlLocale,
}: {
  children: React.ReactNode;
  urlLocale: UrlLocale;
}) {
  const lang = urlLocaleToInternal(urlLocale);
  const router = useRouter();
  const pathname = usePathname();

  const href = useCallback(
    (path: string) => localizedPath(path, urlLocale),
    [urlLocale]
  );

  const setLang = useCallback(
    (next: Locale) => {
      const target = internalToUrlLocale(next);
      if (target === urlLocale) return;
      router.push(switchLocalePath(pathname, target));
      try {
        localStorage.setItem("lang", next);
      } catch {
        // localStorage unavailable
      }
    },
    [pathname, router, urlLocale]
  );

  const value = useMemo(
    () => ({ lang, urlLocale, setLang, href }),
    [lang, urlLocale, setLang, href]
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return ctx;
}
