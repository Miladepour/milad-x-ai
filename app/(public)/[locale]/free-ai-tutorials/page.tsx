import FreeTutorialsPageContent from "@/components/tutorials/FreeTutorialsPageContent";
import { getTutorials } from "@/lib/tutorials/data";
import { TUTORIALS_BASE_PATH, TUTORIALS_HERO_PAGE_ID } from "@/lib/tutorials/constants";
import { SITE_URL, urlLocaleToInternal, type UrlLocale } from "@/lib/i18n/config";
import { localizedPath } from "@/lib/i18n/paths";
import { pageAlternates } from "@/lib/i18n/metadata";
import {
  getPageHeroAbsoluteUrl,
  getPageHeroSrc,
  PAGE_HERO_HEIGHT,
  PAGE_HERO_WIDTH,
} from "@/lib/pages/hero";
import type { Metadata } from "next";

interface FreeTutorialsPageProps {
  params: { locale: string };
}

export function generateMetadata({ params }: FreeTutorialsPageProps): Metadata {
  const locale = params.locale as UrlLocale;
  const internal = urlLocaleToInternal(locale);
  const isFa = internal === "FA";
  const title = isFa ? "آموزش رایگان هوش مصنوعی" : "Free AI Tutorials";
  const description = isFa
    ? "آموزش رایگان هوش مصنوعی به زبان فارسی. ویدیوهای آموزشی، راهنمای گام‌به‌گام و نکات کاربردی برای مبتدیان، تولیدکنندگان محتوا و کسب‌وکارها."
    : "Free AI tutorials. Video lessons, step-by-step guides, and practical tips for beginners, creators, and businesses. Learn AI from scratch with Milad X AI.";
  const heroImage = getPageHeroAbsoluteUrl(TUTORIALS_HERO_PAGE_ID, locale);

  return {
    title,
    description,
    alternates: pageAlternates(TUTORIALS_BASE_PATH, locale),
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${localizedPath(TUTORIALS_BASE_PATH, locale)}`,
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

export default function FreeTutorialsPage({ params }: FreeTutorialsPageProps) {
  const locale = params.locale as UrlLocale;
  const internal = urlLocaleToInternal(locale);
  const tutorials = getTutorials(internal);

  return (
    <FreeTutorialsPageContent
      tutorials={tutorials}
      heroSrc={getPageHeroSrc(TUTORIALS_HERO_PAGE_ID, locale)}
    />
  );
}
