"use client";

import { createContext, useContext, useLayoutEffect, useState } from "react";
import type { Locale } from "./translations";

interface LanguageContextValue {
  lang: Locale;
  setLang: (lang: Locale) => void;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "EN",
  setLang: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Locale>("EN");

  useLayoutEffect(() => {
    try {
      const stored = localStorage.getItem("lang") as Locale | null;
      if (stored === "EN" || stored === "FA") {
        setLangState(stored);
      }
    } catch {
      // localStorage unavailable
    }
  }, []);

  function setLang(next: Locale) {
    setLangState(next);
    try {
      localStorage.setItem("lang", next);
    } catch {
      // localStorage unavailable
    }
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
