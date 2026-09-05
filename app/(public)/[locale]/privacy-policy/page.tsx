import LegalDocumentPage from "@/components/legal/LegalDocumentPage";
import { getPrivacyPolicyHtml } from "@/lib/legal/documents";
import { urlLocaleToInternal, type UrlLocale } from "@/lib/i18n/config";
import { localizedPath } from "@/lib/i18n/paths";
import { pageAlternates } from "@/lib/i18n/metadata";
import { translations } from "@/lib/i18n/translations";
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
  const locale = params.locale as UrlLocale;
  const internal = urlLocaleToInternal(locale);
  const html = getPrivacyPolicyHtml(internal);
  const nav = translations[internal].navbar;
  const footer = translations[internal].footer;
  return (
    <LegalDocumentPage
      html={html}
      dir={internal === "FA" ? "rtl" : "ltr"}
      breadcrumbAria={nav.breadcrumbAria}
      breadcrumbItems={[
        { label: nav.home, href: localizedPath("/", locale) },
        { label: footer.privacyPolicy },
      ]}
    />
  );
}
