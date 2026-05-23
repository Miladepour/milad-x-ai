import type { CourseInclude } from "@/lib/courses/types";
import type { Locale } from "@/lib/i18n/translations";
import { toLocaleDigits } from "@/lib/i18n/digits";
import CourseSectionCard from "./CourseSectionCard";

function IncludeIcon({ index }: { index: number }) {
  const paths = [
    "M4 6h8v6H4z M6 4v2 M10 4v2",
    "M5 4h6v9H5z M7 8h2",
    "M4 7h8M4 10h5",
    "M6 4v8M10 6v4",
    "M4 8h8M4 5h8",
    "M5 11l2-2 2 2 2-3 2 3",
  ];
  const d = paths[index % paths.length];
  return (
    <svg className="w-5 h-5 text-orange shrink-0" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d={d} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface CourseIncludesProps {
  id: string;
  title: string;
  items: CourseInclude[];
  lang: Locale;
}

export default function CourseIncludes({ id, title, items, lang }: CourseIncludesProps) {
  return (
    <CourseSectionCard id={id} title={title}>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((item, i) => (
          <li key={item.text} className="flex gap-3 items-start">
            <IncludeIcon index={i} />
            <span className="type-card-body font-dm text-cream leading-snug">
              {toLocaleDigits(item.text, lang)}
            </span>
          </li>
        ))}
      </ul>
    </CourseSectionCard>
  );
}
