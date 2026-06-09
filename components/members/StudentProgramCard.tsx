import Image from "next/image";
import Link from "next/link";

interface StudentProgramCardProps {
  href: string;
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

export default function StudentProgramCard({
  href,
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
  return (
    <Link
      href={href}
      className="student-glass-strong group flex h-full flex-col overflow-hidden rounded-2xl transition-colors hover:border-orange/30"
    >
      <div className="relative aspect-[16/10] shrink-0 overflow-hidden bg-background">
        {coverImage ? (
          <Image
            src={coverImage}
            alt=""
            fill
            className="object-cover"
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
        <div className="absolute bottom-3 start-3 end-3">
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-orange"
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
          <h3 className="line-clamp-2 font-dm text-lg font-semibold leading-snug text-cream group-hover:text-orange">
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

        <span className="flex w-full items-center justify-center bg-orange py-3.5 font-mono text-xs uppercase tracking-widest text-background transition-colors group-hover:bg-cream">
          {openLabel}
        </span>
      </div>
    </Link>
  );
}
