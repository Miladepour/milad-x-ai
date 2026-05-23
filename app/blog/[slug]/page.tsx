import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllBlogSlugs, getBlogPostBySlug } from "@/lib/blog/store";

interface BlogPostPageProps {
  params: { slug: string };
}

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  return (await getAllBlogSlugs()).map((slug) => ({ slug }));
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post =
    (await getBlogPostBySlug(params.slug, "EN")) ||
    (await getBlogPostBySlug(params.slug, "FA"));

  if (!post) notFound();

  return (
    <div className="flex-1 w-full bg-background text-cream">
      <article className="max-w-3xl mx-auto px-8 md:px-12 lg:px-16 pt-32 pb-24">
        <Link
          href="/blog"
          className="font-dm text-sm text-muted hover:text-cream transition-colors mb-10 inline-block"
        >
          ← Back to blog
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
