import type { Course } from "./types";
import { COURSES_BASE_PATH } from "./constants";
import { isCourseOpenable, hasCourseCover } from "./openable";
import { SITE_URL, type UrlLocale } from "@/lib/i18n/config";
import { localizedPath } from "@/lib/i18n/paths";
import type { Locale } from "@/lib/i18n/translations";

function absolutePublicUrl(path: string): string | undefined {
  if (!path.trim()) return undefined;
  const encoded = path
    .split("/")
    .map((segment, index) => (index === 0 ? segment : encodeURIComponent(segment)))
    .join("/");
  return `${SITE_URL}${encoded}`;
}

export function buildCoursesPageJsonLd(input: {
  locale: UrlLocale;
  lang: Locale;
  title: string;
  description: string;
  faqTitle: string;
  faqs: readonly { question: string; answer: string }[];
  courses: Course[];
}): Record<string, unknown> {
  const pageUrl = `${SITE_URL}${localizedPath(COURSES_BASE_PATH, input.locale)}`;
  const homeUrl = `${SITE_URL}${localizedPath("/", input.locale)}`;
  const provider = {
    "@type": "EducationalOrganization",
    name: "MX AI Academy",
    url: SITE_URL,
    founder: {
      "@type": "Person",
      name: "Milad Pour",
      alternateName: "Milad X AI",
    },
  };

  const courseItems = input.courses.map((course, index) => {
    const courseUrl = isCourseOpenable(course)
      ? `${SITE_URL}${localizedPath(`${COURSES_BASE_PATH}/${course.slug}`, input.locale)}`
      : pageUrl;
    const image = hasCourseCover(course.coverImage)
      ? absolutePublicUrl(course.coverImage)
      : undefined;

    const entity: Record<string, unknown> = {
      "@type": "Course",
      name: course.listTitle,
      description: course.excerpt,
      url: courseUrl,
      inLanguage: input.lang === "FA" ? "fa" : "en",
      provider,
      educationalCredentialAwarded: {
        "@type": "EducationalOccupationalCredential",
        credentialCategory: "Certificate",
        name:
          input.lang === "FA"
            ? "گواهینامه پایان دوره MX AI Academy"
            : "MX AI Academy certificate of completion",
      },
    };

    if (image) entity.image = image;

    if (isCourseOpenable(course) && course.priceUsd > 0) {
      entity.offers = {
        "@type": "Offer",
        price: course.priceUsd,
        priceCurrency: "USD",
        url: courseUrl,
        availability: "https://schema.org/LimitedAvailability",
      };
    }

    return {
      "@type": "ListItem",
      position: index + 1,
      item: entity,
    };
  });

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: input.title,
        description: input.description,
        url: pageUrl,
        inLanguage: input.lang === "FA" ? "fa" : "en",
        isPartOf: {
          "@type": "WebSite",
          name: "MX AI Academy",
          url: SITE_URL,
        },
        about: {
          "@type": "Thing",
          name: input.lang === "FA" ? "دوره هوش مصنوعی" : "AI courses",
        },
        mainEntity: {
          "@type": "ItemList",
          name: input.title,
          numberOfItems: courseItems.length,
          itemListElement: courseItems,
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: input.lang === "FA" ? "خانه" : "Home",
            item: homeUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: input.lang === "FA" ? "دوره‌ها" : "Courses",
            item: pageUrl,
          },
        ],
      },
      {
        "@type": "FAQPage",
        name: input.faqTitle,
        url: `${pageUrl}#faq`,
        mainEntity: input.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      },
    ],
  };
}
