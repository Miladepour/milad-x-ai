import Image from "next/image";
import StudentProgressRing from "@/components/members/StudentProgressRing";
import { STUDENT_DASHBOARD_BANNER_URL } from "@/lib/members/dashboard-constants";

interface StatItem {
  label: string;
  value: string | number;
  hint?: string;
}

interface StudentDashboardHeroProps {
  brandName: string;
  welcomeLabel: string;
  displayName: string;
  subtitle: string;
  initials: string;
  stats: StatItem[];
  progressPercent: number;
  progressLabel: string;
}

export default function StudentDashboardHero({
  brandName,
  welcomeLabel,
  displayName,
  subtitle,
  initials,
  stats,
  progressPercent,
  progressLabel,
}: StudentDashboardHeroProps) {
  return (
    <section className="relative min-h-[240px] overflow-hidden rounded-3xl sm:min-h-[300px]">
      <Image
        src={STUDENT_DASHBOARD_BANNER_URL}
        alt=""
        fill
        priority
        className="object-cover"
        sizes="(max-width: 1400px) 100vw, 1400px"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/55 to-background/25" />
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />

      <div className="relative z-10 flex h-full min-h-[240px] flex-col justify-between p-5 sm:min-h-[300px] sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-orange">
              {brandName}
            </p>
            <h1 className="mt-2 font-dm text-2xl font-semibold text-cream sm:text-4xl">
              {welcomeLabel}, {displayName}
            </h1>
            <p className="mt-2 max-w-xl font-dm text-sm text-cream/65">{subtitle}</p>
          </div>

          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-orange/80 bg-surface/80 font-dm text-sm font-semibold text-cream shadow-[0_0_24px_rgba(255,92,0,0.25)] backdrop-blur-md sm:h-14 sm:w-14 sm:text-base"
            title={displayName}
            aria-label={displayName}
          >
            {initials}
          </div>
        </div>

        <ul className="mt-6 flex flex-wrap items-stretch gap-3">
          {stats.map((stat) => (
            <li
              key={stat.label}
              className="student-glass-pill min-h-[88px] min-w-[140px] flex-1 px-4 py-3 sm:max-w-[200px] sm:flex-none"
            >
              <p className="font-mono text-[10px] uppercase tracking-widest text-cream/50">
                {stat.label}
              </p>
              <p className="mt-1 font-dm text-xl font-semibold text-cream sm:text-2xl">
                {stat.value}
                {stat.hint && (
                  <span className="ms-1 text-sm font-normal text-cream/45">{stat.hint}</span>
                )}
              </p>
            </li>
          ))}
          <li className="student-glass-pill flex min-h-[88px] min-w-[140px] flex-1 items-center justify-center px-3 py-2 sm:max-w-[200px] sm:flex-none sm:px-4">
            <StudentProgressRing
              percent={progressPercent}
              label={progressLabel}
              size={64}
              compact
            />
          </li>
        </ul>
      </div>
    </section>
  );
}
