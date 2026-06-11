import LegalDocumentPage from "@/components/legal/LegalDocumentPage";
import { getPrivacyPolicyHtml } from "@/lib/legal/documents";
import { urlLocaleToInternal, type UrlLocale } from "@/lib/i18n/config";
import { pageAlternates } from "@/lib/i18n/metadata";
import type { Metadata } from "next";

interface PrivacyPageProps {
  params: { locale: string };
}

export function generateMetadata({ params }: PrivacyPageProps): Metadata {
  const locale = params.locale as UrlLocale;
  const internal = urlLocaleToInternal(locale);

  return {
    title: internal === "FA" ? "سیاست حریم خصوصی" : "Privacy Policy",
    description:
      internal === "FA"
        ? "سیاست حریم خصوصی MX AI Academy"
        : "Privacy Policy for MX AI Academy — how we collect and use your personal data",
    alternates: pageAlternates("/privacy-policy", locale),
    robots: { index: true, follow: true },
  };
}

export default function PrivacyPolicyPage({ params }: PrivacyPageProps) {
  const internal = urlLocaleToInternal(params.locale as UrlLocale);
  const html = getPrivacyPolicyHtml(internal);
  return <LegalDocumentPage html={html} dir={internal === "FA" ? "rtl" : "ltr"} />;
}
