import PrivateCoursePageContent from "@/components/private-ai-course/PrivateCoursePageContent";
import { urlLocaleToInternal, type UrlLocale } from "@/lib/i18n/config";
import { pageAlternates } from "@/lib/i18n/metadata";
import type { Metadata } from "next";

interface PrivateAiCoursePageProps {
  params: { locale: string };
}

export function generateMetadata({ params }: PrivateAiCoursePageProps): Metadata {
  const locale = params.locale as UrlLocale;
  const internal = urlLocaleToInternal(locale);

  return {
    title:
      internal === "FA"
        ? "دوره خصوصی هوش مصنوعی آنلاین"
        : "Private AI Courses Online",
    description:
      internal === "FA"
        ? "دوره خصوصی هوش مصنوعی با برنامه اختصاصی، جلسات آنلاین یک به یک و آموزش عملی. مبانی AI، کسب و کار، تولید محتوا، طراحی سایت، وایب کدینگ و n8n."
        : "Learn AI one-to-one through a personalised programme covering AI basics, business, content creation, websites, vibe coding, programming and n8n automation.",
    alternates: pageAlternates("/private-ai-course", locale),
  };
}

export default function PrivateAiCoursePage() {
  return <PrivateCoursePageContent />;
}
