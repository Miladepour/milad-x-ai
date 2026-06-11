"use client";

import Link from "next/link";
import type { MembershipTier, MembershipTierInfo } from "@/lib/members/membership-tier";
import { getMembershipDiscountPercent } from "@/lib/members/membership-tier";

interface StudentPremiumNavCardProps {
  info: MembershipTierInfo;
  href: string;
  onNavigate?: () => void;
  labels: {
    member: string;
    courses: string;
    next: string;
    maxTier: string;
    discountGold: string;
    discountPlatinum: string;
    discountActive: string;
    discountPerksShort: string;
  };
  tierLabels: Record<MembershipTier, string>;
}

const TIER_VISUAL: Record<
  MembershipTier,
  { gradient: string; shine: string; chip: string; bar: string }
> = {
  silver: {
    gradient: "from-[#8a9199] via-[#e8eaed] to-[#6b7280]",
    shine: "from-white/60 via-transparent to-transparent",
    chip: "bg-slate-900/80 text-slate-100",
    bar: "bg-gradient-to-r from-slate-400 to-slate-200",
  },
  gold: {
    gradient: "from-[#b8860b] via-[#ffd700] to-[#daa520]",
    shine: "from-white/70 via-transparent to-transparent",
    chip: "bg-amber-950/80 text-amber-100",
    bar: "bg-gradient-to-r from-amber-600 to-yellow-300",
  },
  platinum: {
    gradient: "from-[#a78bfa] via-[#f0f9ff] to-[#67e8f9]",
    shine: "from-white/80 via-transparent to-transparent",
    chip: "bg-violet-950/80 text-violet-100",
    bar: "bg-gradient-to-r from-violet-400 via-white to-cyan-300",
  },
};

export default function StudentPremiumNavCard({
  info,
  href,
  onNavigate,
  labels,
  tierLabels,
}: StudentPremiumNavCardProps) {
  const visual = TIER_VISUAL[info.tier];
  const tierLabel = tierLabels[info.tier];
  const nextLabel = info.nextTier ? tierLabels[info.nextTier] : null;
  const activeDiscount = getMembershipDiscountPercent(info.tier);

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="premium-card-perspective mt-3 block px-1"
    >
      <div className="premium-card-3d group relative mx-auto w-full max-w-[220px]">
        <div
          className={`relative overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br ${visual.gradient} p-[1px] shadow-[0_18px_40px_-12px_rgba(0,0,0,0.55)] transition-transform duration-500 ease-out group-hover:[transform:rotateX(8deg)_rotateY(-10deg)_translateZ(12px)]`}
          style={{ transformStyle: "preserve-3d" }}
        >
          <div className="relative rounded-[15px] bg-background/10 p-3.5 backdrop-blur-[2px]">
            <div
              className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${visual.shine} opacity-70`}
              aria-hidden
            />
            <div className="relative flex items-start justify-between gap-2">
              <div>
                <p className="font-mono text-[8px] uppercase tracking-[0.22em] text-black/55">
                  {labels.member}
                </p>
                <p className="mt-1 font-dm text-lg font-bold leading-none text-black/90">
                  {tierLabel}
                </p>
              </div>
              <span
                className={`rounded-full px-2 py-1 font-mono text-[9px] uppercase tracking-widest ${visual.chip}`}
              >
                {info.enrollmentCount} {labels.courses}
              </span>
            </div>

            <div className="relative mt-3">
              <div className="h-1.5 overflow-hidden rounded-full bg-black/15">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${visual.bar}`}
                  style={{ width: `${info.progressPercent}%` }}
                />
              </div>
              <p className="mt-2 font-dm text-[10px] leading-snug text-black/65">
                {info.nextTier && info.coursesToNextTier
                  ? `${labels.next}: ${nextLabel} · ${info.coursesToNextTier}`
                  : labels.maxTier}
              </p>
              <p className="mt-1.5 font-dm text-[9px] leading-snug text-black/55">
                {activeDiscount
                  ? labels.discountActive.replace("{percent}", String(activeDiscount))
                  : labels.discountPerksShort}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
