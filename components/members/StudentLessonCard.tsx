import Link from "next/link";
import { previewText } from "@/lib/members/text";
import type { LessonType } from "@/lib/members/types";

interface StudentLessonCardProps {
  href: string;
  index: number;
  title: string;
  description?: string;
  openLabel: string;
  locked?: boolean;
  lockedLabel?: string;
  completed?: boolean;
  completedLabel?: string;
  lessonType?: LessonType;
  typeLabels?: Partial<Record<LessonType, string>>;
}

const TYPE_BADGE: Record<LessonType, string> = {
  video: "▶",
  text: "¶",
  quiz: "?",
};

export default function StudentLessonCard({
  href,
  index,
  title,
  description,
  openLabel,
  locked = false,
  lockedLabel = "Locked",
  completed = false,
  completedLabel = "Completed",
  lessonType = "video",
  typeLabels = {},
}: StudentLessonCardProps) {
  const excerpt = description ? previewText(description, 120) : "";
  const typeLabel = typeLabels[lessonType] ?? lessonType;

  const inner = (
    <div className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-4 sm:py-3">
      <div className="min-w-0 flex-1">
        <p
          className={`font-dm text-base font-semibold leading-snug sm:text-lg ${
            locked ? "text-cream/45" : "text-cream group-hover:text-orange"
          }`}
        >
          <span className="me-2 font-mono text-xs text-orange">#{index + 1}</span>
          <span className="me-2 font-mono text-[10px] uppercase tracking-widest text-cream/40">
            {TYPE_BADGE[lessonType]} {typeLabel}
          </span>
          {title}
        </p>
        {excerpt ? (
          <p className="mt-1 line-clamp-2 font-dm text-xs leading-relaxed text-cream/60 sm:text-sm">
            {excerpt}
          </p>
        ) : null}
      </div>
      {locked ? (
        <span className="inline-flex shrink-0 self-start rounded-full border border-white/15 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-cream/45 sm:self-center">
          {lockedLabel}
        </span>
      ) : completed ? (
        <span className="inline-flex shrink-0 self-start rounded-full border border-emerald-500/40 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-emerald-300 sm:self-center">
          {completedLabel}
        </span>
      ) : (
        <span className="inline-flex shrink-0 self-start rounded-full bg-orange px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-background transition-colors group-hover:bg-cream sm:self-center">
          {openLabel}
        </span>
      )}
    </div>
  );

  if (locked) {
    return (
      <div className="student-glass-pill block cursor-not-allowed opacity-70">{inner}</div>
    );
  }

  return (
    <Link
      href={href}
      className="student-glass-pill group block transition-colors hover:border-orange/40 hover:bg-white/[0.1]"
    >
      {inner}
    </Link>
  );
}
