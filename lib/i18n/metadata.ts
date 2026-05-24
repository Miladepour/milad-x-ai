import { locales, SITE_URL, type UrlLocale } from "./config";
import { localizedPath } from "./paths";

export const siteMetadata: Record<
  UrlLocale,
  { title: string; description: string; keywords: string[] }
> = {
  en: {
    title: "Milad X AI — AI Content Creation Courses & Workshops",
    description:
      "Learn AI content creation with Milad X AI. Live workshops, private courses, and project collaboration — AI image, video, prompts, and automation for creators and businesses.",
    keywords: [
      "AI content creation",
      "AI workshops",
      "prompt engineering",
      "AI video",
      "AI courses",
      "Milad X AI",
    ],
  },
  fa: {
    title: "میلاد X AI — دوره‌ها و کارگاه‌های تولید محتوا با هوش مصنوعی",
    description:
      "با میلاد X AI هوش مصنوعی را برای تولید محتوا یاد بگیرید. کارگاه‌های زنده، دوره‌های خصوصی و همکاری پروژه — تصویر، ویدیو، پرامپت و اتوماسیون برای خالقان محتوا و کسب‌وکارها.",
    keywords: [
      "هوش مصنوعی",
      "تولید محتوا",
      "کارگاه AI",
      "پرامپت",
      "دوره هوش مصنوعی",
      "میلاد X AI",
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
