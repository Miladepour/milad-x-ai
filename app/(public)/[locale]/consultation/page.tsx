import ConsultationPageContent from "@/components/consultation/ConsultationPageContent";
import { SITE_URL, urlLocaleToInternal, type UrlLocale } from "@/lib/i18n/config";
import { localizedPath } from "@/lib/i18n/paths";
import { pageAlternates } from "@/lib/i18n/metadata";
import {
  getPageHeroAbsoluteUrl,
  getPageHeroSrc,
  PAGE_HERO_HEIGHT,
  PAGE_HERO_WIDTH,
} from "@/lib/pages/hero";
import {
  CONSULTATION_BASE_PATH,
  CONSULTATION_HERO_PAGE_ID,
} from "@/lib/consultation/constants";
import type { Metadata } from "next";

interface ConsultationPageProps {
  params: { locale: string };
}

export function generateMetadata({ params }: ConsultationPageProps): Metadata {
  const locale = params.locale as UrlLocale;
  const internal = urlLocaleToInternal(locale);
  const isFa = internal === "FA";
  const title = isFa ? "مشاوره هوش مصنوعی" : "AI Consultation";
  const description = isFa
    ? "رزرو مشاوره ۳۰ دقیقه‌ای یک‌به‌یک با میلاد. برنامه عملی برای استفاده از هوش مصنوعی در کار و کسب‌وکار شما."
    : "Book a focused 30-minute 1:1 AI consultation with Milad. A clear, practical plan for how AI can help you move forward.";
  const heroImage = getPageHeroAbsoluteUrl(CONSULTATION_HERO_PAGE_ID, locale);

  return {
    title,
    description,
    alternates: pageAlternates(CONSULTATION_BASE_PATH, locale),
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${localizedPath(CONSULTATION_BASE_PATH, locale)}`,
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

export default function ConsultationPage({ params }: ConsultationPageProps) {
  const locale = params.locale as UrlLocale;
  return (
    <ConsultationPageContent
      heroSrc={getPageHeroSrc(CONSULTATION_HERO_PAGE_ID, locale)}
    />
  );
}
