import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllBlogSlugs, getBlogPostBySlug } from "@/lib/blog/store";
import { locales, urlLocaleToInternal, type UrlLocale } from "@/lib/i18n/config";
import { localizedPath } from "@/lib/i18n/paths";
import { pageAlternates } from "@/lib/i18n/metadata";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

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
        <time className="font-mono text-xs text-orange block mb-4">{post.date}</time>
        <h1 className="type-course-page-title font-dm font-bold text-cream mb-6">
          {post.title}
        </h1>
        <p className="type-section-body font-dm text-cream leading-relaxed">
          {post.excerpt}
        </p>
        <div className="mt-10 flex flex-col gap-5 font-dm text-lg leading-relaxed text-cream/85">
          {post.content.split(/\n{2,}/).map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </article>
    </div>
  );
}
