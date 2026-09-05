import { urlLocaleToInternal, SITE_URL, type UrlLocale } from "@/lib/i18n/config";
import { localizedPath } from "@/lib/i18n/paths";
import { pageAlternates } from "@/lib/i18n/metadata";
import { getPageHeroAbsoluteUrl, PAGE_HERO_HEIGHT, PAGE_HERO_WIDTH } from "@/lib/pages/hero";
import type { Metadata } from "next";

interface CoursesLayoutProps {
  children: React.ReactNode;
  params: { locale: string };
}

export function generateMetadata({ params }: CoursesLayoutProps): Metadata {
  const locale = params.locale as UrlLocale;
  const internal = urlLocaleToInternal(locale);
  const isFa = internal === "FA";
  const title = isFa
    ? "دوره هوش مصنوعی آنلاین و آفلاین با گواهینامه"
    : "AI Courses Online and Offline with Certificate";
  const description = isFa
    ? "دوره هوش مصنوعی آنلاین و آفلاین در MX AI Academy. مبانی AI، مهندسی پرامپت، تولید محتوا و وایب کدینگ. پس از اتمام دوره گواهینامه صادر می‌شود."
    : "AI courses online and offline at MX AI Academy. Prompt engineering, content creation, agents, and vibe coding. Certificate after you finish.";
  const heroImage = getPageHeroAbsoluteUrl("courses", locale);

  return {
    title,
    description,
    keywords: isFa
      ? [
          "دوره هوش مصنوعی",
          "آموزش هوش مصنوعی",
          "دوره آنلاین هوش مصنوعی",
          "دوره آفلاین هوش مصنوعی",
          "گواهینامه هوش مصنوعی",
          "مهندسی پرامپت",
          "تولید محتوا با هوش مصنوعی",
          "وایب کدینگ",
        ]
      : [
          "AI courses",
          "online AI course",
          "offline AI course",
          "AI certificate",
          "prompt engineering course",
          "AI content creation",
          "vibe coding course",
        ],
    alternates: pageAlternates("/courses", locale),
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${localizedPath("/courses", locale)}`,
      locale: isFa ? "fa_IR" : "en_GB",
      type: "website",
      siteName: "MX AI Academy",
      ...(heroImage
        ? {
            images: [
              {
                url: heroImage,
                width: PAGE_HERO_WIDTH,
                height: PAGE_HERO_HEIGHT,
                alt: title,
              },
            ],
          }
        : {}),
    },
  };
}

export default function CoursesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
