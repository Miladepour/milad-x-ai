import type { Metadata } from "next";
import { Cormorant_Garamond, Poppins, Space_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SiteJsonLd from "@/components/layout/SiteJsonLd";
import { LanguageProvider } from "@/lib/i18n/context";
import HtmlDirSync from "@/components/layout/HtmlDirSync";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Milad X AI — AI Content Creation Courses & Workshops",
    template: "%s | Milad X AI",
  },
  description:
    "Learn AI content creation with Milad X AI. Live workshops, private courses, and project collaboration — AI image, video, prompts, and automation for creators and businesses.",
  keywords: [
    "AI content creation",
    "AI workshops",
    "prompt engineering",
    "AI video",
    "AI courses",
    "Milad X AI",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${cormorant.variable} ${poppins.variable} ${spaceMono.variable}`}
    >
      <body className="bg-background text-cream font-dm antialiased min-h-screen flex flex-col">
        <SiteJsonLd />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var l=localStorage.getItem("lang");if(l==="FA"){var h=document.documentElement;h.setAttribute("dir","rtl");h.setAttribute("lang","fa");h.classList.add("rtl");}}catch(e){}})();`,
          }}
        />
        <LanguageProvider>
          <HtmlDirSync />
          <Navbar />
          <main className="flex-1 flex flex-col min-h-0">{children}</main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
