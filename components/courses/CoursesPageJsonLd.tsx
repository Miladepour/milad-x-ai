import { buildCoursesPageJsonLd } from "@/lib/courses/catalog-jsonld";
import type { Course } from "@/lib/courses/types";
import type { UrlLocale } from "@/lib/i18n/config";
import { urlLocaleToInternal } from "@/lib/i18n/config";
import { translations } from "@/lib/i18n/translations";

interface CoursesPageJsonLdProps {
  locale: UrlLocale;
  courses: Course[];
}

export default function CoursesPageJsonLd({ locale, courses }: CoursesPageJsonLdProps) {
  const lang = urlLocaleToInternal(locale);
  const p = translations[lang].coursesPage;
  const schema = buildCoursesPageJsonLd({
    locale,
    lang,
    title: p.title,
    description: `${p.description} ${p.descriptionMore}`,
    faqTitle: p.faqTitle,
    faqs: p.faqItems,
    courses,
  });

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
