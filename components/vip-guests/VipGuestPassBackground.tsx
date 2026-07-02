interface VipGuestPassBackgroundProps {
  className?: string;
}

export default function VipGuestPassBackground({ className = "" }: VipGuestPassBackgroundProps) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-[#0D0D0D]" />

      {/* Stage light from above — the lanyard hangs out of this glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_95%_60%_at_50%_-8%,rgba(255,92,0,0.5)_0%,rgba(255,92,0,0.1)_45%,transparent_70%)]" />
      {/* Hot core right at the hang point */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_18%_at_50%_0%,rgba(255,150,60,0.4)_0%,transparent_70%)]" />
      {/* Counter-glows in the corners */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_94%_86%,rgba(255,92,0,0.2)_0%,transparent_58%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_45%_38%_at_4%_70%,rgba(255,120,20,0.13)_0%,transparent_55%)]" />

      {/* Fine blueprint grid, fading toward the bottom */}
      <div
        className="absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,92,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,92,0,0.05) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "linear-gradient(180deg, black 0%, rgba(0,0,0,0.4) 55%, transparent 90%)",
          WebkitMaskImage:
            "linear-gradient(180deg, black 0%, rgba(0,0,0,0.4) 55%, transparent 90%)",
        }}
      />

      {/* Geometric line art */}
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.26]"
        viewBox="0 0 400 800"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
      >
        <circle cx="330" cy="110" r="150" stroke="#FF5C00" strokeWidth="0.6" opacity="0.5" />
        <circle cx="330" cy="110" r="112" stroke="#FF5C00" strokeWidth="0.5" opacity="0.35" />
        <circle cx="330" cy="110" r="76" stroke="#FF8C2A" strokeWidth="0.4" opacity="0.25" />
        <circle cx="64" cy="660" r="130" stroke="#FF8C2A" strokeWidth="0.5" opacity="0.3" />
        <circle cx="64" cy="660" r="92" stroke="#FF5C00" strokeWidth="0.4" opacity="0.2" />
        <path d="M0 270 L120 170 L240 290 L400 150" stroke="#FF5C00" strokeWidth="0.6" opacity="0.28" />
        <path d="M20 730 L140 610 L260 730 L380 570" stroke="#FF8C2A" strokeWidth="0.5" opacity="0.2" />
        <polygon points="345,50 390,95 345,140 300,95" stroke="#FF5C00" strokeWidth="0.6" fill="none" opacity="0.35" />
        <polygon points="345,72 368,95 345,118 322,95" stroke="#FF5C00" strokeWidth="0.4" fill="none" opacity="0.22" />
        <line x1="30" y1="60" x2="90" y2="60" stroke="#FF5C00" strokeWidth="0.6" opacity="0.3" />
        <line x1="30" y1="72" x2="66" y2="72" stroke="#FF5C00" strokeWidth="0.6" opacity="0.2" />
        <circle cx="52" cy="230" r="2.5" fill="#FF5C00" opacity="0.4" />
        <circle cx="368" cy="420" r="2" fill="#FF8C2A" opacity="0.35" />
        <circle cx="120" cy="520" r="1.5" fill="#FF5C00" opacity="0.3" />
      </svg>

      {/* Grain + vignette */}
      <div className="certificate-noise-overlay absolute inset-0 opacity-[0.22] mix-blend-soft-light" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_90%_at_50%_45%,transparent_55%,rgba(0,0,0,0.45)_100%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />
    </div>
  );
}
