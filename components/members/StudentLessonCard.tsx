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
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10px] text-orange">#{index + 1}</p>
          <p className="mt-1 font-dm text-xl font-semibold text-cream group-hover:text-orange sm:text-2xl">
            {title}
          </p>
          {excerpt ? (
            <p className="mt-2 line-clamp-2 font-dm text-sm leading-relaxed text-cream/60">
              {excerpt}
            </p>
          ) : null}
        </div>
        <span className="inline-flex shrink-0 self-start rounded-full bg-orange px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-background transition-colors group-hover:bg-cream sm:self-center">
          {openLabel}
        </span>
      </div>
    </Link>
  );
}
