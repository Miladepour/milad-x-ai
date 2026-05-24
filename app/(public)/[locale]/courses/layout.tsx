import { urlLocaleToInternal, type UrlLocale } from "@/lib/i18n/config";
import { pageAlternates } from "@/lib/i18n/metadata";
import type { Metadata } from "next";

interface CoursesLayoutProps {
  children: React.ReactNode;
  params: { locale: string };
}

export function generateMetadata({ params }: CoursesLayoutProps): Metadata {
  const locale = params.locale as UrlLocale;
  const internal = urlLocaleToInternal(locale);

  return {
    title: internal === "FA" ? "دوره‌ها" : "Courses",
    description:
      internal === "FA"
        ? "دوره‌ها و کارگاه‌های تولید محتوا با هوش مصنوعی"
        : "AI content creation masterclasses and workshops by Milad",
    alternates: pageAlternates("/courses", locale),
  };
}

export default function CoursesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
