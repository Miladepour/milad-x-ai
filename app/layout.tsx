import type { Metadata } from "next";
import { Cormorant_Garamond, Poppins, Space_Mono } from "next/font/google";
import { SITE_URL } from "@/lib/i18n/config";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  verification: {
    google: "nEdTgGDkDJexhPrlCgE2yYIk6Jd3XoO46OKzDBqEQ3s",
  },
};

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      suppressHydrationWarning
      className={`${cormorant.variable} ${poppins.variable} ${spaceMono.variable}`}
    >
      <body className="bg-background text-cream font-dm antialiased min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
