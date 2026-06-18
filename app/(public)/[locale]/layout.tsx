import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SiteJsonLd from "@/components/layout/SiteJsonLd";
import HtmlDirSync from "@/components/layout/HtmlDirSync";
import { LanguageProvider } from "@/lib/i18n/context";
import { isValidLocale, locales, type UrlLocale } from "@/lib/i18n/config";
import { pageAlternates, siteMetadata } from "@/lib/i18n/metadata";

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: { locale: string };
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Metadata {
  if (!isValidLocale(params.locale)) {
    return {};
  }

  const locale = params.locale as UrlLocale;
  const meta = siteMetadata[locale];

  return {
    title: {
      default: meta.title,
      template: "%s | Milad X AI",
    },
    description: meta.description,
    keywords: meta.keywords,
    alternates: pageAlternates("/", locale),
  };
}

export default function LocaleLayout({ children, params }: LocaleLayoutProps) {
  if (!isValidLocale(params.locale)) {
    notFound();
  }

  const locale = params.locale as UrlLocale;

  return (
    <LanguageProvider urlLocale={locale}>
      <HtmlDirSync />
      <SiteJsonLd />
      <Navbar />
      <main className="flex-1 flex flex-col min-h-0">{children}</main>
      <Footer />
    </LanguageProvider>
  );
}
