import PrivateCoursePageContent from "@/components/private-ai-course/PrivateCoursePageContent";
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
  PRIVATE_AI_COURSE_BASE_PATH,
  PRIVATE_COURSE_HERO_PAGE_ID,
} from "@/lib/private-ai-course/constants";
import type { Metadata } from "next";

interface PrivateAiCoursePageProps {
  params: { locale: string };
}

export function generateMetadata({ params }: PrivateAiCoursePageProps): Metadata {
  const locale = params.locale as UrlLocale;
  const internal = urlLocaleToInternal(locale);
  const isFa = internal === "FA";
  const title = isFa
    ? "دوره خصوصی هوش مصنوعی آنلاین"
    : "Private AI Courses Online";
  const description = isFa
    ? "دوره خصوصی هوش مصنوعی با برنامه اختصاصی، جلسات آنلاین یک به یک و آموزش عملی. مبانی AI، کسب و کار، تولید محتوا، طراحی سایت، وایب کدینگ و n8n."
    : "Learn AI one-to-one through a personalised programme covering AI basics, business, content creation, websites, vibe coding, programming and n8n automation.";
  const heroImage = getPageHeroAbsoluteUrl(PRIVATE_COURSE_HERO_PAGE_ID, locale);

  return {
    title,
    description,
    alternates: pageAlternates(PRIVATE_AI_COURSE_BASE_PATH, locale),
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${localizedPath(PRIVATE_AI_COURSE_BASE_PATH, locale)}`,
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

export default function PrivateAiCoursePage({ params }: PrivateAiCoursePageProps) {
  const locale = params.locale as UrlLocale;
  return (
    <PrivateCoursePageContent
      heroSrc={getPageHeroSrc(PRIVATE_COURSE_HERO_PAGE_ID, locale)}
    />
  );
}
