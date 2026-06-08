import type { Metadata } from "next";
import NotFoundContent from "@/components/errors/NotFoundContent";
import Footer from "@/components/layout/Footer";
import HtmlDirSync from "@/components/layout/HtmlDirSync";
import Navbar from "@/components/layout/Navbar";
import { LanguageProvider } from "@/lib/i18n/context";

export const metadata: Metadata = {
  title: "Page not found",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <LanguageProvider urlLocale="en">
      <HtmlDirSync />
      <Navbar />
      <main className="flex min-h-screen flex-1 flex-col">
        <NotFoundContent />
      </main>
      <Footer />
    </LanguageProvider>
  );
}
