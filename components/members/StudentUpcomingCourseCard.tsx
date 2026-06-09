import Image from "next/image";
import Link from "next/link";
import { displayExcerpt } from "@/lib/members/text";

interface StudentUpcomingCourseCardProps {
  href: string;
  title: string;
  excerpt: string;
  date: string;
  statusLabel: string;
  isLive: boolean;
  coverImage: string;
  viewLabel: string;
}

export default function StudentUpcomingCourseCard({
  href,
  title,
  excerpt,
  date,
  statusLabel,
  isLive,
  coverImage,
  viewLabel,
}: StudentUpcomingCourseCardProps) {
  const summary = displayExcerpt(excerpt, 72);

  return (
    <Link
      href={href}
      className="group relative block h-full w-full overflow-hidden rounded-xl shadow-[0_8px_28px_rgba(0,0,0,0.3)] transition-transform duration-300 hover:scale-[1.01]"
    >
      <div className="relative aspect-[16/10] w-full bg-surface">
        {coverImage ? (
          <Image
            src={coverImage}
            alt=""
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
            unoptimized={coverImage.startsWith("http")}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-orange via-orange/70 to-background" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/10" />

        <span className="absolute end-3 top-3 z-10 rounded-full bg-orange px-3.5 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-wide text-background shadow-[0_4px_16px_rgba(255,92,0,0.45)] sm:text-xs">
          {date}
        </span>

        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1.5 p-3 sm:p-3.5">
          <span className="inline-flex w-fit items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 font-mono text-[9px] uppercase tracking-widest text-cream backdrop-blur-sm">
            {isLive && <span className="student-live-dot !h-1.5 !w-1.5" aria-hidden />}
            {statusLabel}
          </span>

          <h3 className="line-clamp-1 font-dm text-sm font-semibold leading-snug text-cream sm:text-base">
            {title}
          </h3>

          {summary ? (
            <p className="line-clamp-1 font-dm text-xs leading-relaxed text-cream/75">
              {summary}
            </p>
          ) : null}

          <span className="mt-0.5 w-full rounded-full bg-cream py-2.5 text-center font-mono text-xs uppercase tracking-widest text-background transition-colors group-hover:bg-orange group-hover:text-cream">
            {viewLabel}
          </span>
        </div>
      </div>
    </Link>
  );
}
