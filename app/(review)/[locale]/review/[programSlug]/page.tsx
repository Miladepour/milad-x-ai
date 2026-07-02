import { notFound } from "next/navigation";
import ReviewPageContent from "@/components/reviews/ReviewPageContent";
import { urlLocaleToInternal, type UrlLocale } from "@/lib/i18n/config";
import { pageAlternates } from "@/lib/i18n/metadata";
import { resolveProgramTitle } from "@/lib/members/program-localized";
import { getPublishedReviewProgramBySlug } from "@/lib/reviews/store";
import type { Metadata } from "next";

interface ReviewProgramPageProps {
  params: { locale: string; programSlug: string };
}

export async function generateMetadata({
  params,
}: ReviewProgramPageProps): Promise<Metadata> {
  const locale = params.locale as UrlLocale;
  const internal = urlLocaleToInternal(locale);
  const program = await getPublishedReviewProgramBySlug(params.programSlug);

  if (!program) {
    return {
      title: internal === "FA" ? "ثبت نظر" : "Course review",
    };
  }

  const title = resolveProgramTitle(
    {
      id: program.id,
      slug: program.slug,
      titleEn: program.titleEn,
      titleFa: program.titleFa,
      descriptionEn: "",
      descriptionFa: "",
      title: program.titleEn || program.titleFa,
      description: "",
      coverImage: null,
      sortOrder: 0,
      status: "published",
      usefulLinks: [],
      certificateEnabled: false,
      certificateTitleEn: null,
      certificateTitleFa: null,
      certificateHours: null,
      comingSoon: false,
      programType: "main",
      createdAt: "",
      updatedAt: "",
    },
    internal
  );

  return {
    title: internal === "FA" ? `نظر درباره ${title}` : `Review · ${title}`,
    description:
      internal === "FA"
        ? `بازخورد خود را درباره ${title} با ما به اشتراک بگذارید`
        : `Share your feedback about ${title}`,
    alternates: pageAlternates(`/review/${params.programSlug}`, locale),
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function ReviewProgramPage({ params }: ReviewProgramPageProps) {
  const program = await getPublishedReviewProgramBySlug(params.programSlug);
  if (!program) notFound();

  return <ReviewPageContent initialProgram={program} />;
}
