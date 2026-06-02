import ConsultationPageContent from "@/components/consultation/ConsultationPageContent";
import { urlLocaleToInternal, type UrlLocale } from "@/lib/i18n/config";
import { pageAlternates } from "@/lib/i18n/metadata";
import type { Metadata } from "next";

interface ConsultationPageProps {
  params: { locale: string };
}

export function generateMetadata({ params }: ConsultationPageProps): Metadata {
  const locale = params.locale as UrlLocale;
  const internal = urlLocaleToInternal(locale);

  return {
    title: internal === "FA" ? "مشاوره هوش مصنوعی" : "AI Consultation",
    description:
      internal === "FA"
        ? "رزرو مشاوره ۳۰ دقیقه‌ای یک‌به‌یک با میلاد — برنامه عملی برای استفاده از هوش مصنوعی در کار و کسب‌وکار شما."
        : "Book a focused 30-minute 1:1 AI consultation with Milad — a clear, practical plan for how AI can help you move forward.",
    alternates: pageAlternates("/consultation", locale),
  };
}

export default function ConsultationPage() {
  return <ConsultationPageContent />;
}
