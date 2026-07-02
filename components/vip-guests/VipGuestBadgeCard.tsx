import type { LocaleCode } from "@/lib/supabase/database.types";
import { formatVipEventDate } from "@/lib/vip-guests/copy";
import {
  getVipBadgeSizeTokens,
  type VipBadgeSize,
} from "@/lib/vip-guests/badge-sizes";

export interface VipGuestBadgeData {
  fullName: string;
  guestTitle: string;
  eventTitle: string;
  eventDate: string;
  locale: LocaleCode;
}

interface VipGuestBadgeCardProps {
  data: VipGuestBadgeData;
  className?: string;
  size?: VipBadgeSize;
}

export default function VipGuestBadgeCard({
  data,
  className = "",
  size = "page",
}: VipGuestBadgeCardProps) {
  const isFa = data.locale === "FA";
  const formattedDate = formatVipEventDate(data.eventDate, data.locale);
  const t = getVipBadgeSizeTokens(size);

  return (
    <div
      className={`premium-card-perspective ${className}`}
      style={{ perspective: 1200, width: t.cardWidth }}
    >
      <div
        className="relative"
        style={{
          transform: `rotateX(${t.tiltRotateX}deg) rotateY(${t.tiltRotateY}deg)`,
          transformStyle: "preserve-3d",
        }}
      >
        {/* Card thickness — bottom + side edges */}
        <div
          aria-hidden
          className="absolute"
          style={{
            left: 4,
            right: 4,
            bottom: -6,
            height: 12,
            borderRadius: `0 0 ${t.cardRadius}px ${t.cardRadius}px`,
            background: "linear-gradient(180deg, #4A1200 0%, #1C0600 100%)",
            transform: "translateZ(-4px)",
          }}
        />
        <div
          aria-hidden
          className="absolute"
          style={{
            top: 8,
            bottom: -2,
            right: -4,
            width: 8,
            borderRadius: `0 ${t.cardRadius}px ${t.cardRadius}px 0`,
            background: "linear-gradient(90deg, #7A2400 0%, #2A0A00 100%)",
            transform: "translateZ(-3px)",
          }}
        />

        <div
          className="relative overflow-hidden"
          style={{
            width: t.cardWidth,
            height: t.cardHeight,
            borderRadius: t.cardRadius,
            boxShadow: [
              "inset 0 1px 0 rgba(255,255,255,0.28)",
              "inset 0 -2px 6px rgba(0,0,0,0.3)",
              "0 3px 0 #3D0A00",
              "0 20px 40px rgba(0,0,0,0.5)",
              "0 45px 90px rgba(0,0,0,0.55)",
              "0 0 80px rgba(255,92,0,0.18)",
            ].join(", "),
          }}
        >
          {/* Base surface — dark top melting into signal orange */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(160deg, #1A0500 0%, #4A1000 30%, #922400 52%, #E04A00 74%, #FF7A1F 96%)",
            }}
          />
          {/* Molten glow pooling bottom-right */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(120% 85% at 88% 100%, rgba(255,150,50,0.55) 0%, rgba(255,92,0,0.18) 45%, transparent 70%)",
            }}
          />
          {/* Cool falloff top-left keeps the dark zone rich, not muddy */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(90% 60% at 0% 0%, rgba(0,0,0,0.5) 0%, transparent 60%)",
            }}
          />

          {/* Gloss sweep */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(115deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.05) 22%, transparent 40%, transparent 68%, rgba(0,0,0,0.18) 100%)",
            }}
          />

          {/* Fine grain on the card face */}
          <div
            aria-hidden
            data-export-noise-opacity="0.07"
            className="certificate-noise-overlay pointer-events-none absolute inset-0 opacity-[0.14] mix-blend-soft-light"
          />

          {/* Geometric etching */}
          <svg
            aria-hidden
            className="pointer-events-none absolute inset-0 h-full w-full opacity-25"
            viewBox="0 0 280 440"
            fill="none"
            preserveAspectRatio="none"
          >
            <circle cx="235" cy="95" r="130" stroke="white" strokeWidth="0.5" opacity="0.35" />
            <circle cx="235" cy="95" r="96" stroke="white" strokeWidth="0.5" opacity="0.28" />
            <circle cx="235" cy="95" r="62" stroke="white" strokeWidth="0.5" opacity="0.2" />
            <circle cx="235" cy="95" r="30" stroke="white" strokeWidth="0.5" opacity="0.14" />
            <path d="M-10 210 L70 130 L150 210 L290 90" stroke="white" strokeWidth="0.5" opacity="0.22" />
            <path d="M10 400 L92 318 L174 400 L290 292" stroke="white" strokeWidth="0.5" opacity="0.16" />
            <polygon points="244,52 282,90 244,128 206,90" stroke="white" strokeWidth="0.5" fill="none" opacity="0.3" />
            <polygon points="244,68 266,90 244,112 222,90" stroke="white" strokeWidth="0.4" fill="none" opacity="0.2" />
          </svg>

          {/* Inner hairline frame */}
          <div
            aria-hidden
            className="pointer-events-none absolute border border-white/15"
            style={{
              inset: Math.max(6, Math.round(t.cardWidth * 0.028)),
              borderRadius: Math.max(8, t.cardRadius - 8),
            }}
          />

          {/* Punch hole with metal grommet — clasp hook passes through here */}
          <div
            className="absolute left-1/2 z-30 -translate-x-1/2 rounded-full"
            style={{
              top: t.holeTop,
              width: t.holeDiameter + 8,
              height: t.holeDiameter + 8,
              background:
                "conic-gradient(from 210deg, #D8D8D8, #8F8F8F 25%, #E8E8E8 50%, #7A7A7A 75%, #D8D8D8)",
              boxShadow: "0 1px 2px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.6)",
              padding: 4,
            }}
          >
            <div
              className="h-full w-full rounded-full bg-[#080200]"
              style={{ boxShadow: "inset 0 2px 5px rgba(0,0,0,0.9)" }}
            />
          </div>

          {/* Content */}
          <div
            className={`relative z-10 flex h-full flex-col px-6 pb-6 ${isFa ? "text-right" : "text-left"}`}
            dir={isFa ? "rtl" : "ltr"}
            style={{ paddingTop: t.contentPaddingTop }}
          >
            <p
              className="font-dm leading-snug text-white/70"
              style={{
                fontSize: t.taglinePx,
                letterSpacing: "0.02em",
                maxWidth: "88%",
                ...(isFa ? { marginRight: 0, marginLeft: "auto" } : {}),
              }}
            >
              {isFa
                ? "MX AI Academy — جایی که پتانسیل واقعی خلق با هوش مصنوعی آزاد می‌شود"
                : "MX AI Academy unlocks the true potential of AI-powered creation."}
            </p>

            <div className="mt-auto">
              <p
                className="font-dm font-bold italic leading-[0.95] tracking-tight"
                style={{
                  fontSize: t.rolePx,
                  paddingBottom: "0.08em",
                  backgroundImage:
                    "linear-gradient(120deg, #FFFFFF 0%, #FFE3C2 35%, #FFB36B 70%, #FFF6EA 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.35))",
                }}
              >
                {data.guestTitle}
              </p>
              <h2
                className="mt-2 font-dm font-bold leading-tight tracking-tight text-white"
                style={{
                  fontSize: t.namePx,
                  textShadow: "0 2px 8px rgba(0,0,0,0.35)",
                }}
              >
                {data.fullName}
              </h2>
            </div>

            <div className="mt-4 border-t border-white/25 pt-4">
              <p
                className="font-mono uppercase tracking-[0.24em] text-white/60"
                style={{ fontSize: t.eventLabelPx }}
              >
                {isFa ? "رویداد" : "Event"}
              </p>
              <p
                className="mt-1 font-dm font-semibold leading-snug text-white"
                style={{ fontSize: t.eventTitlePx }}
              >
                {data.eventTitle}
              </p>
              <p
                className="mt-1 font-dm text-white/80"
                style={{ fontSize: t.eventDatePx }}
              >
                {formattedDate}
              </p>
            </div>

            <div className={`mt-5 ${isFa ? "text-right" : "text-left"}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/miladxailogo9.png"
                alt="MX AI Academy"
                width={140}
                height={48}
                crossOrigin="anonymous"
                className={`block w-auto object-contain ${isFa ? "ml-auto" : ""}`}
                style={{
                  height: t.logoHeight,
                  filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.4))",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
