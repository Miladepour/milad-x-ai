import BlogCoursePromo from "@/components/blog/BlogCoursePromo";
import BlogPromptBox from "@/components/blog/BlogPromptBox";
import {
  BLOG_COURSE_CARDS_MARKER,
  BLOG_PROMPT_ANIMATION_MARKER,
  BLOG_PROMPT_TEMPLATE_MARKER,
} from "@/lib/blog/constants";
import {
  PAPER_CUT_COLLAGE_ANIMATION_PROMPT,
  PAPER_CUT_COLLAGE_PROMPT_TEMPLATE,
} from "@/lib/blog/paper-cut-collage-prompts";
import type { UrlLocale } from "@/lib/i18n/config";
import sanitizeHtml from "sanitize-html";

const EMBED_MARKERS = [
  BLOG_COURSE_CARDS_MARKER,
  BLOG_PROMPT_TEMPLATE_MARKER,
  BLOG_PROMPT_ANIMATION_MARKER,
] as const;

type EmbedMarker = (typeof EMBED_MARKERS)[number];

const sanitizeOptions: sanitizeHtml.IOptions = {
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
    "pre",
    "code",
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
};

function renderHtml(html: string) {
  const safeHtml = sanitizeHtml(html, sanitizeOptions);
  return (
    <div
      className="flex flex-col gap-5 [&_a]:text-orange [&_a]:underline [&_a]:underline-offset-4 [&_blockquote]:border-l-2 [&_blockquote]:border-orange [&_blockquote]:pl-4 [&_code]:rounded [&_code]:bg-surface [&_code]:px-2 [&_code]:py-1 [&_code]:font-mono [&_code]:text-sm [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-orange [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-orange [&_img]:rounded-sm [&_img]:border [&_img]:border-surface [&_ol]:list-decimal [&_ol]:pl-6 [&_pre]:overflow-x-auto [&_pre]:rounded-sm [&_pre]:border [&_pre]:border-surface [&_pre]:bg-surface/60 [&_pre]:p-4 [&_ul]:list-disc [&_ul]:pl-6"
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}

function renderEmbed(marker: EmbedMarker, locale: UrlLocale, slug: string) {
  if (marker === BLOG_COURSE_CARDS_MARKER) {
    return <BlogCoursePromo key={marker} locale={locale} />;
  }

  if (slug === "paper-cut-collage-prompt") {
    if (marker === BLOG_PROMPT_TEMPLATE_MARKER) {
      return (
        <BlogPromptBox
          key={marker}
          title="PROMPT TEMPLATE"
          text={PAPER_CUT_COLLAGE_PROMPT_TEMPLATE}
        />
      );
    }
    if (marker === BLOG_PROMPT_ANIMATION_MARKER) {
      return (
        <BlogPromptBox
          key={marker}
          title="ANIMATION PROMPT"
          text={PAPER_CUT_COLLAGE_ANIMATION_PROMPT}
        />
      );
    }
  }

  return null;
}

export function splitBlogContent(content: string): string[] {
  const pattern = new RegExp(
    `(${EMBED_MARKERS.map((marker) => marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
    "g"
  );
  return content.split(pattern).filter((part) => part.length > 0);
}

interface BlogPostContentProps {
  content: string;
  locale: UrlLocale;
  slug: string;
}

export default function BlogPostContent({ content, locale, slug }: BlogPostContentProps) {
  const isHtml = /<\/?[a-z][\s\S]*>/i.test(content);
  if (!isHtml) {
    return (
      <div className="flex flex-col gap-5">
        {content.split(/\n{2,}/).map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    );
  }

  const parts = splitBlogContent(content);

  return (
    <>
      {parts.map((part, index) => {
        if (EMBED_MARKERS.includes(part as EmbedMarker)) {
          return (
            <div key={`${part}-${index}`}>
              {renderEmbed(part as EmbedMarker, locale, slug)}
            </div>
          );
        }
        return part.trim() ? <div key={index}>{renderHtml(part)}</div> : null;
      })}
    </>
  );
}
