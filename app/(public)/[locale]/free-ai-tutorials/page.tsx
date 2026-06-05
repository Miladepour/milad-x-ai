import FreeTutorialsPageContent from "@/components/tutorials/FreeTutorialsPageContent";
import { getTutorials } from "@/lib/tutorials/data";
import { TUTORIALS_BASE_PATH } from "@/lib/tutorials/constants";
import { urlLocaleToInternal, type UrlLocale } from "@/lib/i18n/config";
import { pageAlternates } from "@/lib/i18n/metadata";
import type { Metadata } from "next";

interface FreeTutorialsPageProps {
  params: { locale: string };
}

export function generateMetadata({ params }: FreeTutorialsPageProps): Metadata {
  const locale = params.locale as UrlLocale;
  const internal = urlLocaleToInternal(locale);

  return {
    title:
      internal === "FA" ? "آموزش رایگان هوش مصنوعی" : "Free AI Tutorials",
    description:
      internal === "FA"
        ? "آموزش رایگان هوش مصنوعی به زبان فارسی — ویدیوهای آموزشی، راهنمای گام‌به‌گام و نکات کاربردی برای مبتدیان، تولیدکنندگان محتوا و کسب‌وکارها. یادگیری AI از صفر با میلاد X AI."
        : "Free AI tutorials — video lessons, step-by-step guides, and practical tips for beginners, creators, and businesses. Learn AI from scratch with Milad X AI.",
    alternates: pageAlternates(TUTORIALS_BASE_PATH, locale),
  };
}

export default function FreeTutorialsPage({ params }: FreeTutorialsPageProps) {
  const locale = urlLocaleToInternal(params.locale as UrlLocale);
  const tutorials = getTutorials(locale);

  return <FreeTutorialsPageContent tutorials={tutorials} />;
}
