import type { CourseBlock } from "@/lib/courses/types";
import { toLocaleDigits } from "@/lib/i18n/digits";
import type { Locale } from "@/lib/i18n/translations";
import { cn } from "@/lib/utils";

function localizeText(text: string, lang: Locale): string {
  return toLocaleDigits(text, lang);
}

export function CourseBlocks({
  blocks,
  lang,
}: {
  blocks: CourseBlock[];
  lang: Locale;
}) {
  return (
    <div className="flex flex-col gap-5">
      {blocks.map((block, i) => (
        <CourseBlockRenderer key={i} block={block} lang={lang} />
      ))}
    </div>
  );
}

function CourseBlockRenderer({
  block,
  lang,
}: {
  block: CourseBlock;
  lang: Locale;
}) {
  switch (block.type) {
    case "paragraph":
      return (
        <p className="type-section-body font-dm text-cream leading-relaxed">
          {localizeText(block.text, lang)}
        </p>
      );
    case "heading":
      return (
        <h3
          className={cn(
            "font-dm font-semibold text-cream",
            block.level === 2 ? "type-course-block-h3 mt-2" : "type-course-block-h4 mt-4"
          )}
        >
          {localizeText(block.text, lang)}
        </h3>
      );
    case "list":
      if (block.ordered) {
        return (
          <ol className="type-section-body font-dm text-cream list-decimal list-inside space-y-2 leading-relaxed pr-1">
            {block.items.map((item, i) => (
              <li key={i}>{localizeText(item, lang)}</li>
            ))}
          </ol>
        );
      }
      return (
        <ul className="type-section-body font-dm text-cream space-y-2 leading-relaxed">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-3">
              <span className="text-orange shrink-0 mt-1.5">◆</span>
              <span>{localizeText(item, lang)}</span>
            </li>
          ))}
        </ul>
      );
    case "items":
      return (
        <ul className="flex flex-col gap-6">
          {block.items.map((item, i) => (
            <li
              key={i}
              className="border border-surface rounded-sm p-5 md:p-6 bg-surface/40"
            >
              <h4 className="type-course-block-h4 font-dm font-semibold text-cream mb-2">
                {localizeText(item.title, lang)}
              </h4>
              <p className="type-card-body font-dm text-cream leading-relaxed">
                {localizeText(item.description, lang)}
              </p>
            </li>
          ))}
        </ul>
      );
    default:
      return null;
  }
}
