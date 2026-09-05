import { locales, SITE_URL, type UrlLocale } from "./config";
import { localizedPath } from "./paths";

export const siteMetadata: Record<
  UrlLocale,
  { title: string; description: string; keywords: string[] }
> = {
  en: {
    title: "MX AI Academy | AI Courses by Milad X Talks",
    description:
      "Learn AI at MX AI Academy. Practical AI courses, private training, live workshops and free tutorials with Milad, for creators and businesses.",
    keywords: [
      "MX AI Academy",
      "Milad X Talks",
      "AI courses",
      "AI training",
      "private AI course",
      "AI workshops",
      "Milad",
    ],
  },
  fa: {
    title: "دوره‌های آموزش هوش مصنوعی | MX AI Academy",
    description:
      "دوره‌های آموزش هوش مصنوعی در MX AI Academy. دوره آنلاین و آفلاین، دوره خصوصی، کارگاه زنده و آموزش رایگان با میلاد.",
    keywords: [
      "دوره‌های آموزش هوش مصنوعی",
      "آموزش هوش مصنوعی",
      "MX AI Academy",
      "Milad X Talks",
      "دوره خصوصی هوش مصنوعی",
      "کارگاه هوش مصنوعی",
      "میلاد",
    ],
  },
};

/** hreflang + canonical for a logical path (without locale prefix). */
export function pageAlternates(logicalPath: string, locale: UrlLocale) {
  const languages = Object.fromEntries(
    locales.map((l) => [l, `${SITE_URL}${localizedPath(logicalPath, l)}`])
  ) as Record<string, string>;

  languages["x-default"] = `${SITE_URL}${localizedPath(logicalPath, "en")}`;

  return {
    canonical: `${SITE_URL}${localizedPath(logicalPath, locale)}`,
    languages,
  };
}
