import type { Metadata } from "next";
import NotFoundContent from "@/components/errors/NotFoundContent";

export const metadata: Metadata = {
  title: "Page not found",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LocaleNotFound() {
  return <NotFoundContent />;
}
