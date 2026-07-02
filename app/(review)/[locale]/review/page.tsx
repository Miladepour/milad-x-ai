import ReviewPageContent from "@/components/reviews/ReviewPageContent";
import { urlLocaleToInternal, type UrlLocale } from "@/lib/i18n/config";
import { pageAlternates } from "@/lib/i18n/metadata";
import type { Metadata } from "next";

interface ReviewPageProps {
  params: { locale: string };
}

export function generateMetadata({ params }: ReviewPageProps): Metadata {
  const locale = params.locale as UrlLocale;
  const internal = urlLocaleToInternal(locale);

  return {
    title: internal === "FA" ? "ثبت نظر" : "Course review",
    description:
      internal === "FA"
        ? "بازخورد خود را درباره دوره با ما به اشتراک بگذارید"
        : "Share your feedback about the course",
    alternates: pageAlternates("/review", locale),
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function ReviewPage() {
  return <ReviewPageContent />;
}
