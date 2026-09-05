import PortfolioPageContent from "@/components/portfolio/PortfolioPageContent";
import { PORTFOLIO_BASE_PATH, PORTFOLIO_HERO_PAGE_ID } from "@/lib/portfolio/constants";
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

interface PortfolioPageProps {
  params: { locale: string };
}

export function generateMetadata({ params }: PortfolioPageProps): Metadata {
  const locale = params.locale as UrlLocale;
  const internal = urlLocaleToInternal(locale);
  const isFa = internal === "FA";
  const title = isFa ? "نمونه‌کار" : "Portfolio";
  const description = isFa
    ? "ویدیو، تصویر و اپلیکیشن‌های ساخته‌شده با هوش مصنوعی توسط میلاد"
    : "AI-generated video, images, and applications by Milad X AI";
  const heroImage = getPageHeroAbsoluteUrl(PORTFOLIO_HERO_PAGE_ID, locale);

  return {
    title,
    description,
    alternates: pageAlternates(PORTFOLIO_BASE_PATH, locale),
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${localizedPath(PORTFOLIO_BASE_PATH, locale)}`,
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

export default function PortfolioPage({ params }: PortfolioPageProps) {
  const locale = params.locale as UrlLocale;
  return (
    <PortfolioPageContent
      heroSrc={getPageHeroSrc(PORTFOLIO_HERO_PAGE_ID, locale)}
    />
  );
}
