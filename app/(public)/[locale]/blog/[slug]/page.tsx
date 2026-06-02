import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getAllBlogSlugs, getBlogPostBySlug } from "@/lib/blog/store";
import { locales, urlLocaleToInternal, type UrlLocale } from "@/lib/i18n/config";
import { localizedPath } from "@/lib/i18n/paths";
import { pageAlternates } from "@/lib/i18n/metadata";
import type { Metadata } from "next";
import sanitizeHtml from "sanitize-html";

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
  const safeHtml = sanitizeHtml(post.content, {
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
      "img",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "title"],
      "*": ["class"],
    },
    allowedSchemes: ["http", "https"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noreferrer noopener" }),
    },
  });
  const isHtml = /<\/?[a-z][\s\S]*>/i.test(post.content);

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
        <h1 className="type-course-page-title font-dm font-bold text-cream mb-6">
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
          {isHtml ? (
            <div
              className="flex flex-col gap-5 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-cream [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-cream [&_a]:text-orange [&_a]:underline [&_a]:underline-offset-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_blockquote]:border-l-2 [&_blockquote]:border-orange [&_blockquote]:pl-4 [&_img]:rounded-sm [&_img]:border [&_img]:border-surface"
              dangerouslySetInnerHTML={{ __html: safeHtml }}
            />
          ) : (
            <div className="flex flex-col gap-5">
              {post.content.split(/\n{2,}/).map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          )}
        </div>
      </article>
    </div>
  );
}
