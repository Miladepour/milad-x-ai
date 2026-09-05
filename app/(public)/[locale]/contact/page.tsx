import ContactPageContent from "@/components/contact/ContactPageContent";
import { CONTACT_BASE_PATH, CONTACT_HERO_PAGE_ID } from "@/lib/contact/constants";
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

interface ContactPageProps {
  params: { locale: string };
}

export function generateMetadata({ params }: ContactPageProps): Metadata {
  const locale = params.locale as UrlLocale;
  const internal = urlLocaleToInternal(locale);
  const isFa = internal === "FA";
  const title = isFa ? "تماس" : "Contact";
  const description = isFa
    ? "با میلاد X AI تماس بگیرید. همکاری، دوره خصوصی و مشاوره."
    : "Get in touch with Milad X AI for collaboration, private courses, and consulting.";
  const heroImage = getPageHeroAbsoluteUrl(CONTACT_HERO_PAGE_ID, locale);

  return {
    title,
    description,
    alternates: pageAlternates(CONTACT_BASE_PATH, locale),
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${localizedPath(CONTACT_BASE_PATH, locale)}`,
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

export default function ContactPage({ params }: ContactPageProps) {
  const locale = params.locale as UrlLocale;
  return (
    <ContactPageContent heroSrc={getPageHeroSrc(CONTACT_HERO_PAGE_ID, locale)} />
  );
}
