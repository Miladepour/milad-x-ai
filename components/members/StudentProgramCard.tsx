import Image from "next/image";
import Link from "next/link";

interface StudentProgramCardProps {
  href?: string;
  locked?: boolean;
  title: string;
  description: string;
  coverImage: string | null;
  progressPercent: number;
  completedLessons: number;
  totalLessons: number;
  accessLabel: string;
  accessValue: string;
  progressLabel: string;
  lessonsLabel: string;
  openLabel: string;
}

function LockIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

export default function StudentProgramCard({
  href,
  locked = false,
  title,
  description,
  coverImage,
  progressPercent,
  completedLessons,
  totalLessons,
  accessLabel,
  accessValue,
  progressLabel,
  lessonsLabel,
  openLabel,
}: StudentProgramCardProps) {
  const cardClassName = `student-glass-strong group flex h-full flex-col overflow-hidden rounded-2xl transition-colors ${
    locked
      ? "cursor-not-allowed opacity-90"
      : "hover:border-orange/30"
  }`;

  const content = (
    <>
      <div className="relative aspect-[16/10] shrink-0 overflow-hidden bg-background">
        {coverImage ? (
          <Image
            src={coverImage}
            alt=""
            fill
            className={`object-cover ${locked ? "grayscale-[35%]" : ""}`}
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-orange via-[#b84300] to-background">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.18),transparent_45%)]" />
            <div className="absolute inset-0 flex items-center justify-center p-5 text-center">
              <p className="line-clamp-4 font-dm text-lg font-bold leading-snug text-cream sm:text-xl">
                {title}
              </p>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/20 to-transparent" />
        {locked && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/45 backdrop-blur-[1px]">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-orange/40 bg-background/80 text-orange shadow-lg">
              <LockIcon />
            </div>
          </div>
        )}
        <div className="absolute bottom-3 start-3 end-3">
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className={`h-full rounded-full ${locked ? "bg-cream/40" : "bg-orange"}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-cream/70">
            {progressPercent}% {progressLabel}
          </p>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex flex-1 flex-col p-5 pb-4">
          <h3
            className={`line-clamp-2 font-dm text-lg font-semibold leading-snug ${
              locked ? "text-cream/75" : "text-cream group-hover:text-orange"
            }`}
          >
            {title}
          </h3>
          <p className="mt-2 line-clamp-2 flex-1 font-dm text-sm leading-relaxed text-cream/60">
            {description || "\u00a0"}
          </p>
          <p className="mt-4 font-dm text-sm font-medium leading-relaxed text-cream sm:text-base">
            <span className="font-semibold">
              {completedLessons}/{totalLessons} {lessonsLabel}
            </span>
            <span className="mx-2 text-cream/50">·</span>
            <span>
              {accessLabel}: {accessValue}
            </span>
          </p>
        </div>

        <span
          className={`flex w-full items-center justify-center py-3.5 font-mono text-xs uppercase tracking-widest transition-colors ${
            locked
              ? "bg-white/[0.06] text-cream/55"
              : "bg-orange text-background group-hover:bg-cream"
          }`}
        >
          {openLabel}
        </span>
      </div>
    </>
  );

  if (locked || !href) {
    return <div className={cardClassName}>{content}</div>;
  }

  return (
    <Link href={href} className={cardClassName}>
      {content}
    </Link>
  );
}
