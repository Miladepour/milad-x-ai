import LegalDocumentPage from "@/components/legal/LegalDocumentPage";
import { getTermsAndConditionsHtml } from "@/lib/legal/documents";
import { urlLocaleToInternal, type UrlLocale } from "@/lib/i18n/config";
import { pageAlternates } from "@/lib/i18n/metadata";
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
  const internal = urlLocaleToInternal(params.locale as UrlLocale);
  const html = getTermsAndConditionsHtml(internal);
  return <LegalDocumentPage html={html} dir={internal === "FA" ? "rtl" : "ltr"} />;
}
