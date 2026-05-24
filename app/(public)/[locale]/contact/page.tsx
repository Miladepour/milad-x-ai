import ContactPageContent from "@/components/contact/ContactPageContent";
import { urlLocaleToInternal, type UrlLocale } from "@/lib/i18n/config";
import { pageAlternates } from "@/lib/i18n/metadata";
import type { Metadata } from "next";

interface ContactPageProps {
  params: { locale: string };
}

export function generateMetadata({ params }: ContactPageProps): Metadata {
  const locale = params.locale as UrlLocale;
  const internal = urlLocaleToInternal(locale);

  return {
    title: internal === "FA" ? "تماس" : "Contact",
    description:
      internal === "FA"
        ? "با میلاد X AI تماس بگیرید — همکاری، دوره خصوصی و مشاوره"
        : "Get in touch with Milad X AI — collaboration, private courses, and consulting",
    alternates: pageAlternates("/contact", locale),
  };
}

export default function ContactPage() {
  return <ContactPageContent />;
}
