import BlogListing from "@/components/blog/BlogListing";
import { getBlogPosts } from "@/lib/blog/store";
import { urlLocaleToInternal, type UrlLocale } from "@/lib/i18n/config";
import { pageAlternates } from "@/lib/i18n/metadata";
import type { Metadata } from "next";

interface BlogPageProps {
  params: { locale: string };
}

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const locale = params.locale as UrlLocale;
  const internal = urlLocaleToInternal(locale);

  return {
    title: internal === "FA" ? "وبلاگ" : "Blog",
    description:
      internal === "FA"
        ? "مقالات و نکات تولید محتوا با هوش مصنوعی از میلاد X AI"
        : "Articles and AI content creation insights from Milad X AI",
    alternates: pageAlternates("/blog", locale),
  };
}

export default async function BlogPage({ params }: BlogPageProps) {
  const locale = params.locale as UrlLocale;
  const posts = await getBlogPosts(urlLocaleToInternal(locale));

  return <BlogListing initialPosts={posts} />;
}
