import Link from "next/link";
import { previewText } from "@/lib/members/text";

interface StudentLessonCardProps {
  href: string;
  index: number;
  title: string;
  description?: string;
  openLabel: string;
}

export default function StudentLessonCard({
  href,
  index,
  title,
  description,
  openLabel,
}: StudentLessonCardProps) {
  const excerpt = description ? previewText(description, 120) : "";

  return (
    <Link
      href={href}
      className="student-glass-pill group block transition-colors hover:border-orange/40 hover:bg-white/[0.1]"
    >
      <div className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-4 sm:py-3">
        <div className="min-w-0 flex-1">
          <p className="font-dm text-base font-semibold leading-snug text-cream group-hover:text-orange sm:text-lg">
            <span className="me-2 font-mono text-xs text-orange">#{index + 1}</span>
            {title}
          </p>
          {excerpt ? (
            <p className="mt-1 line-clamp-2 font-dm text-xs leading-relaxed text-cream/60 sm:text-sm">
              {excerpt}
            </p>
          ) : null}
        </div>
        <span className="inline-flex shrink-0 self-start rounded-full bg-orange px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-background transition-colors group-hover:bg-cream sm:self-center">
          {openLabel}
        </span>
      </div>
    </Link>
  );
}
