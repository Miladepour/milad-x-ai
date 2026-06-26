import Link from "next/link";
import { notFound } from "next/navigation";
import { getTutorialBySlug, getTutorialSlugs } from "@/lib/tutorials/data";
import { TUTORIALS_BASE_PATH } from "@/lib/tutorials/constants";
import { youtubeEmbedUrl } from "@/lib/tutorials/youtube";
import TutorialSocialLinks from "@/components/tutorials/TutorialSocialLinks";
import TutorialsCtaBanner from "@/components/tutorials/TutorialsCtaBanner";
import { locales, urlLocaleToInternal, type UrlLocale } from "@/lib/i18n/config";
import { localizedPath } from "@/lib/i18n/paths";
import { pageAlternates } from "@/lib/i18n/metadata";
import type { Metadata } from "next";
import sanitizeHtml from "sanitize-html";

export const revalidate = 86400;

interface TutorialPageProps {
  params: { locale: string; slug: string };
}

export async function generateStaticParams() {
  const slugs = getTutorialSlugs();
  return locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({
  params,
}: TutorialPageProps): Promise<Metadata> {
  const locale = params.locale as UrlLocale;
  const internal = urlLocaleToInternal(locale);
  const tutorial = getTutorialBySlug(params.slug, internal);

  if (!tutorial) {
    return {
      title: internal === "FA" ? "آموزش رایگان" : "Free AI Tutorials",
    };
  }

  return {
    title: tutorial.title,
    description: tutorial.excerpt,
    alternates: pageAlternates(`${TUTORIALS_BASE_PATH}/${params.slug}`, locale),
  };
}

function sanitizeTutorialHtml(html: string) {
  return sanitizeHtml(html, {
    allowedTags: [
      "p",
      "br",
      "strong",
      "em",
      "u",
      "h2",
      "h3",
      "ul",
      "ol",
      "li",
      "blockquote",
      "a",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      "*": ["class"],
    },
    allowedSchemes: ["http", "https"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noreferrer noopener" }),
    },
  });
}

export default function TutorialPage({ params }: TutorialPageProps) {
  const locale = params.locale as UrlLocale;
  const internal = urlLocaleToInternal(locale);
  const tutorial = getTutorialBySlug(params.slug, internal);

  if (!tutorial) notFound();

  const backLabel =
    internal === "FA" ? "بازگشت به آموزش‌های رایگان" : "← Back to free tutorials";
  const authorLabel = internal === "FA" ? "نویسنده:" : "Author:";
  const safeHtml = sanitizeTutorialHtml(tutorial.content);

  return (
    <div className="flex-1 w-full bg-background text-cream">
      <article className="max-w-3xl mx-auto px-8 md:px-12 lg:px-16 pt-32 pb-24">
        <Link
          href={localizedPath(TUTORIALS_BASE_PATH, locale)}
          className="font-dm text-sm text-muted hover:text-cream transition-colors mb-10 inline-block"
        >
          {backLabel}
        </Link>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4">
          <time className="font-mono text-xs text-orange">{tutorial.date}</time>
          <span className="font-mono text-xs text-cream/60">
            {authorLabel} {tutorial.author}
          </span>
        </div>

        <h1 className="type-course-page-title font-dm font-bold text-cream mb-6">
          {tutorial.title}
        </h1>

        <div className="mb-8">
          <div className="relative aspect-video w-full overflow-hidden rounded-[30px] border border-surface bg-background">
            <iframe
              src={youtubeEmbedUrl(tutorial.youtubeId)}
              title={tutorial.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          </div>
          <TutorialSocialLinks className="mt-5" />
        </div>

        <p className="type-section-body font-dm text-cream leading-relaxed mb-8">
          {tutorial.excerpt}
        </p>

        <div
          className="font-dm text-lg leading-relaxed text-cream/85 flex flex-col gap-5 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-cream [&_h2]:mt-4 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-cream [&_a]:text-orange [&_a]:underline [&_a]:underline-offset-4 [&_ul]:list-disc [&_ul]:ps-6 [&_ol]:list-decimal [&_ol]:ps-6 [&_li]:mb-1"
          dangerouslySetInnerHTML={{ __html: safeHtml }}
        />

        <TutorialsCtaBanner className="mt-14" />
      </article>
    </div>
  );
}
