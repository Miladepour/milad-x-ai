import Image from "next/image";
import { notFound } from "next/navigation";
import BlogPostContent from "@/components/blog/BlogPostContent";
import PageBreadcrumb from "@/components/layout/PageBreadcrumb";
import { getAllBlogSlugs, getBlogPostBySlug } from "@/lib/blog/store";
import { BLOG_BASE_PATH } from "@/lib/blog/constants";
import { SITE_URL, locales, urlLocaleToInternal, type UrlLocale } from "@/lib/i18n/config";
import { localizedPath } from "@/lib/i18n/paths";
import { pageAlternates } from "@/lib/i18n/metadata";
import { translations } from "@/lib/i18n/translations";
import type { Metadata } from "next";

export const revalidate = 3600;

/** Standard Open Graph / Twitter share size */
const OG_IMAGE_WIDTH = 1200;
const OG_IMAGE_HEIGHT = 630;

interface BlogPostPageProps {
  params: { locale: string; slug: string };
}

function absoluteCoverUrl(coverImage?: string | null): string | undefined {
  if (!coverImage?.trim()) return undefined;
  if (/^https?:\/\//i.test(coverImage)) return coverImage;
  return `${SITE_URL}${coverImage.startsWith("/") ? "" : "/"}${coverImage}`;
}

export async function generateStaticParams() {
  const slugs = await getAllBlogSlugs();
  return locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const locale = params.locale as UrlLocale;
  const internal = urlLocaleToInternal(locale);
  const post = await getBlogPostBySlug(params.slug, internal);

  if (!post) {
    return { title: internal === "FA" ? "وبلاگ" : "Blog" };
  }

  const isFa = internal === "FA";
  const path = `${BLOG_BASE_PATH}/${params.slug}`;
  const url = `${SITE_URL}${localizedPath(path, locale)}`;
  const imageUrl = absoluteCoverUrl(post.coverImage);
  const ogImages = imageUrl
    ? [
        {
          url: imageUrl,
          width: OG_IMAGE_WIDTH,
          height: OG_IMAGE_HEIGHT,
          alt: post.title,
        },
      ]
    : undefined;

  return {
    title: post.title,
    description: post.excerpt,
    authors: [{ name: post.author }],
    alternates: pageAlternates(path, locale),
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url,
      locale: isFa ? "fa_IR" : "en_GB",
      type: "article",
      siteName: "MX AI Academy",
      publishedTime: post.publishedAt,
      authors: [post.author],
      ...(ogImages ? { images: ogImages } : {}),
    },
    twitter: {
      card: ogImages ? "summary_large_image" : "summary",
      title: post.title,
      description: post.excerpt,
      ...(ogImages ? { images: [imageUrl!] } : {}),
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const locale = params.locale as UrlLocale;
  const internal = urlLocaleToInternal(locale);
  const post = await getBlogPostBySlug(params.slug, internal);

  if (!post) notFound();

  const nav = translations[internal].navbar;

  return (
    <div className="flex-1 w-full bg-background text-cream">
      <article className="max-w-3xl mx-auto px-8 md:px-12 lg:px-16 pt-32 pb-24">
        <PageBreadcrumb
          ariaLabel={nav.breadcrumbAria}
          className="mb-10"
          items={[
            { label: nav.home, href: localizedPath("/", locale) },
            { label: nav.blog, href: localizedPath("/blog", locale) },
            { label: post.title },
          ]}
        />
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4">
          <time className="font-mono text-xs text-orange">{post.date}</time>
          <span className="font-mono text-xs text-cream/60">
            {internal === "FA" ? "نویسنده:" : "Author:"} {post.author}
          </span>
        </div>
        <h1 className="font-dm text-2xl md:text-[1.65rem] font-bold leading-snug text-orange mb-6">
          {post.title}
        </h1>
        {post.coverImage ? (
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-sm border border-surface bg-background mb-8">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
              unoptimized={post.coverImage.startsWith("http")}
              priority
            />
          </div>
        ) : null}
        <p className="type-section-body font-dm text-cream leading-relaxed">
          {post.excerpt}
        </p>
        <div className="mt-10 font-dm text-lg leading-relaxed text-cream/85">
          <BlogPostContent content={post.content} locale={locale} slug={post.slug} />
        </div>
      </article>
    </div>
  );
}
