import { notFound } from "next/navigation";
import HtmlDirSync from "@/components/layout/HtmlDirSync";
import { LanguageProvider } from "@/lib/i18n/context";
import { isValidLocale, locales, type UrlLocale } from "@/lib/i18n/config";

interface VipLocaleLayoutProps {
  children: React.ReactNode;
  params: { locale: string };
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function VipLocaleLayout({ children, params }: VipLocaleLayoutProps) {
  if (!isValidLocale(params.locale)) {
    notFound();
  }

  const locale = params.locale as UrlLocale;

  return (
    <LanguageProvider urlLocale={locale}>
      <HtmlDirSync />
      <main
        dir={locale === "fa" ? "rtl" : "ltr"}
        lang={locale}
        className="min-h-screen flex flex-col bg-background text-cream"
      >
        {children}
      </main>
    </LanguageProvider>
  );
}
