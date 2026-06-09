interface StudentProgressRingProps {
  percent: number;
  label: string;
  sublabel?: string;
  size?: number;
  compact?: boolean;
}

export default function StudentProgressRing({
  percent,
  label,
  sublabel,
  size = 120,
  compact = false,
}: StudentProgressRingProps) {
  const stroke = compact ? 8 : 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div
      className={`flex flex-col items-center text-center ${compact ? "gap-1" : "gap-3"}`}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
          aria-hidden
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#FF5C00"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-[stroke-dashoffset] duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={`font-dm font-semibold text-cream ${compact ? "text-base" : "text-2xl"}`}
          >
            {percent}%
          </span>
        </div>
      </div>
      {compact ? (
        <p className="max-w-[5.5rem] text-center font-mono text-[8px] uppercase leading-tight tracking-widest text-cream/50">
          {label}
        </p>
      ) : (
        <div>
          <p className="font-dm text-sm font-medium text-cream">{label}</p>
          {sublabel && (
            <p className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-cream/45">
              {sublabel}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
