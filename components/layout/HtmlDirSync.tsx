"use client";

import { useLayoutEffect } from "react";
import { useLanguage } from "@/lib/i18n/context";

export default function HtmlDirSync() {
  const { lang } = useLanguage();

  useLayoutEffect(() => {
    const html = document.documentElement;
    if (lang === "FA") {
      html.setAttribute("dir", "rtl");
      html.setAttribute("lang", "fa");
      html.classList.add("rtl");
    } else {
      html.setAttribute("dir", "ltr");
      html.setAttribute("lang", "en");
      html.classList.remove("rtl");
    }
  }, [lang]);

  return null;
}
