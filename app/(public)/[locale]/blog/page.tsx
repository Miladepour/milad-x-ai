import BlogListing from "@/components/blog/BlogListing";
import { getBlogPosts } from "@/lib/blog/store";
import { BLOG_BASE_PATH, BLOG_HERO_PAGE_ID } from "@/lib/blog/constants";
import { SITE_URL, urlLocaleToInternal, type UrlLocale } from "@/lib/i18n/config";
import { localizedPath } from "@/lib/i18n/paths";
import { pageAlternates } from "@/lib/i18n/metadata";
import {
  getPageHeroAbsoluteUrl,
  getPageHeroSrc,
  PAGE_HERO_HEIGHT,
  PAGE_HERO_WIDTH,
} from "@/lib/pages/hero";
import type { Metadata } from "next";

interface BlogPageProps {
  params: { locale: string };
}

export const revalidate = 3600;

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const locale = params.locale as UrlLocale;
  const internal = urlLocaleToInternal(locale);
  const isFa = internal === "FA";
  const title = isFa ? "وبلاگ هوش مصنوعی" : "AI Blog";
  const description = isFa
    ? "مقاله‌های کاربردی هوش مصنوعی برای محتوا، طراحی، ویدیو و کار روزمره از MX AI Academy."
    : "Practical AI articles on content, design, video, and everyday workflows from MX AI Academy.";
  const heroImage = getPageHeroAbsoluteUrl(BLOG_HERO_PAGE_ID, locale);

  return {
    title,
    description,
    alternates: pageAlternates(BLOG_BASE_PATH, locale),
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${localizedPath(BLOG_BASE_PATH, locale)}`,
      locale: isFa ? "fa_IR" : "en_GB",
      type: "website",
      siteName: "MX AI Academy",
      ...(heroImage
        ? {
            images: [
              {
                url: heroImage,
                width: PAGE_HERO_WIDTH,
                height: PAGE_HERO_HEIGHT,
                alt: title,
              },
            ],
          }
        : {}),
    },
  };
}

export default async function BlogPage({ params }: BlogPageProps) {
  const locale = params.locale as UrlLocale;
  const posts = await getBlogPosts(urlLocaleToInternal(locale));

  return (
    <BlogListing
      initialPosts={posts}
      heroSrc={getPageHeroSrc(BLOG_HERO_PAGE_ID, locale)}
    />
  );
}
