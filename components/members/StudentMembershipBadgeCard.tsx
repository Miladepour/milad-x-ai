import type { MembershipTier, MembershipTierInfo } from "@/lib/members/membership-tier";
import { getMembershipDiscountPercent } from "@/lib/members/membership-tier";
import StudentGlassCard from "@/components/members/StudentGlassCard";

interface StudentMembershipBadgeCardProps {
  info: MembershipTierInfo;
  labels: {
    title: string;
    subtitle: string;
    coursesEnrolled: string;
    progressTo: string;
    maxTier: string;
    enrollFirst: string;
    tierRanges: string;
    coursesToGo: string;
    discountGold: string;
    discountPlatinum: string;
    discountActive: string;
    discountUnlock: string;
  };
  tierLabels: Record<MembershipTier, string>;
}

const TIER_THEME: Record<
  MembershipTier,
  { ring: string; badge: string; bar: string; glow: string }
> = {
  silver: {
    ring: "from-slate-300/40 via-slate-100/20 to-slate-500/30",
    badge: "bg-gradient-to-br from-slate-300 via-slate-100 to-slate-400 text-slate-900",
    bar: "from-slate-400 to-slate-200",
    glow: "shadow-slate-400/20",
  },
  gold: {
    ring: "from-amber-500/40 via-yellow-300/20 to-amber-600/30",
    badge: "bg-gradient-to-br from-amber-500 via-yellow-300 to-amber-600 text-amber-950",
    bar: "from-amber-600 to-yellow-300",
    glow: "shadow-amber-500/25",
  },
  platinum: {
    ring: "from-violet-400/40 via-cyan-200/20 to-fuchsia-400/30",
    badge: "bg-gradient-to-br from-violet-400 via-white to-cyan-300 text-violet-950",
    bar: "from-violet-400 via-white to-cyan-300",
    glow: "shadow-violet-400/25",
  },
};

export default function StudentMembershipBadgeCard({
  info,
  labels,
  tierLabels,
}: StudentMembershipBadgeCardProps) {
  const theme = TIER_THEME[info.tier];
  const tierLabel = tierLabels[info.tier];
  const nextLabel = info.nextTier ? tierLabels[info.nextTier] : null;

  const progressCaption =
    info.enrollmentCount === 0
      ? labels.enrollFirst
      : info.nextTier && info.coursesToNextTier
        ? `${info.coursesToNextTier} ${labels.coursesToGo} ${nextLabel}`
        : labels.maxTier;

  const activeDiscount = getMembershipDiscountPercent(info.tier);

  return (
    <StudentGlassCard className="overflow-hidden !p-0">
      <div className={`relative bg-gradient-to-br ${theme.ring} p-[1px]`}>
        <div className="relative bg-background/80 p-5 sm:p-6">
          <div
            className={`pointer-events-none absolute -end-8 -top-8 h-32 w-32 rounded-full blur-3xl ${theme.glow}`}
            aria-hidden
          />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`premium-card-perspective flex h-[88px] w-[88px] shrink-0 items-center justify-center rounded-2xl border border-white/20 shadow-xl ${theme.badge}`}
                style={{ transform: "rotateX(6deg) rotateY(-8deg)" }}
              >
                <span className="font-dm text-2xl font-bold">{tierLabel.charAt(0)}</span>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-orange">
                  {labels.title}
                </p>
                <h2 className="mt-1 font-dm text-2xl font-semibold text-cream sm:text-3xl">
                  {tierLabel}
                </h2>
                <p className="mt-1 font-dm text-sm text-cream/60">{labels.subtitle}</p>
              </div>
            </div>

            <div className="sm:min-w-[220px] sm:text-end">
              <p className="font-mono text-[10px] uppercase tracking-widest text-cream/45">
                {labels.coursesEnrolled}
              </p>
              <p className="font-dm text-3xl font-semibold text-cream">{info.enrollmentCount}</p>
            </div>
          </div>

          <div className="relative mt-5">
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="font-dm text-sm text-cream/70">{progressCaption}</p>
              <p className="font-mono text-[10px] uppercase tracking-widest text-cream/45">
                {info.progressPercent}%
              </p>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${theme.bar} transition-all duration-700`}
                style={{ width: `${info.progressPercent}%` }}
              />
            </div>
            <p className="mt-3 font-dm text-xs text-cream/45">{labels.tierRanges}</p>
            <ul className="mt-3 flex flex-col gap-1.5 border-t border-white/[0.08] pt-3">
              <li className="font-dm text-xs text-cream/55">{labels.discountGold}</li>
              <li className="font-dm text-xs text-cream/55">{labels.discountPlatinum}</li>
              {activeDiscount ? (
                <li className="font-dm text-sm font-medium text-orange">
                  {labels.discountActive.replace("{percent}", String(activeDiscount))}
                </li>
              ) : (
                <li className="font-dm text-xs text-cream/45">{labels.discountUnlock}</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </StudentGlassCard>
  );
}
