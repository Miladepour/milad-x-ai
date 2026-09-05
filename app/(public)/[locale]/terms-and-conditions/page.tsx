import LegalDocumentPage from "@/components/legal/LegalDocumentPage";
import { getTermsAndConditionsHtml } from "@/lib/legal/documents";
import { urlLocaleToInternal, type UrlLocale } from "@/lib/i18n/config";
import { localizedPath } from "@/lib/i18n/paths";
import { pageAlternates } from "@/lib/i18n/metadata";
import { translations } from "@/lib/i18n/translations";
import type { Metadata } from "next";

interface TermsPageProps {
  params: { locale: string };
}

export function generateMetadata({ params }: TermsPageProps): Metadata {
  const locale = params.locale as UrlLocale;
  const internal = urlLocaleToInternal(locale);

  return {
    title: internal === "FA" ? "شرایط و ضوابط" : "Terms and Conditions",
    description:
      internal === "FA"
        ? "شرایط و ضوابط استفاده از MX AI Academy"
        : "Terms and Conditions for MX AI Academy website, courses, and digital products",
    alternates: pageAlternates("/terms-and-conditions", locale),
    robots: { index: true, follow: true },
  };
}

export default function TermsAndConditionsPage({
  params,
}: TermsPageProps) {
  const locale = params.locale as UrlLocale;
  const internal = urlLocaleToInternal(locale);
  const html = getTermsAndConditionsHtml(internal);
  const nav = translations[internal].navbar;
  const footer = translations[internal].footer;
  return (
    <LegalDocumentPage
      html={html}
      dir={internal === "FA" ? "rtl" : "ltr"}
      breadcrumbAria={nav.breadcrumbAria}
      breadcrumbItems={[
        { label: nav.home, href: localizedPath("/", locale) },
        { label: footer.termsAndConditions },
      ]}
    />
  );
}
