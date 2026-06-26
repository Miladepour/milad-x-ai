import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import BlogPostContent from "@/components/blog/BlogPostContent";
import { getAllBlogSlugs, getBlogPostBySlug } from "@/lib/blog/store";
import { locales, urlLocaleToInternal, type UrlLocale } from "@/lib/i18n/config";
import { localizedPath } from "@/lib/i18n/paths";
import { pageAlternates } from "@/lib/i18n/metadata";
import type { Metadata } from "next";

export const revalidate = 3600;

interface BlogPostPageProps {
  params: { locale: string; slug: string };
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

  return {
    title: post.title,
    description: post.excerpt,
    alternates: pageAlternates(`/blog/${params.slug}`, locale),
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const locale = params.locale as UrlLocale;
  const internal = urlLocaleToInternal(locale);
  const post = await getBlogPostBySlug(params.slug, internal);

  if (!post) notFound();

  const backLabel = internal === "FA" ? "بازگشت به وبلاگ" : "← Back to blog";

  return (
    <div className="flex-1 w-full bg-background text-cream">
      <article className="max-w-3xl mx-auto px-8 md:px-12 lg:px-16 pt-32 pb-24">
        <Link
          href={localizedPath("/blog", locale)}
          className="font-dm text-sm text-muted hover:text-cream transition-colors mb-10 inline-block"
        >
          {backLabel}
        </Link>
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
              alt=""
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
