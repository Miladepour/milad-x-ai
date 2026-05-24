import PortfolioPageContent from "@/components/portfolio/PortfolioPageContent";
import { urlLocaleToInternal, type UrlLocale } from "@/lib/i18n/config";
import { pageAlternates } from "@/lib/i18n/metadata";
import type { Metadata } from "next";

interface PortfolioPageProps {
  params: { locale: string };
}

export function generateMetadata({ params }: PortfolioPageProps): Metadata {
  const locale = params.locale as UrlLocale;
  const internal = urlLocaleToInternal(locale);

  return {
    title: internal === "FA" ? "نمونه‌کار" : "Portfolio",
    description:
      internal === "FA"
        ? "ویدیو، تصویر و اپلیکیشن‌های ساخته‌شده با هوش مصنوعی توسط میلاد"
        : "AI-generated video, images, and applications by Milad X AI",
    alternates: pageAlternates("/portfolio", locale),
  };
}

export default function PortfolioPage() {
  return <PortfolioPageContent />;
}
