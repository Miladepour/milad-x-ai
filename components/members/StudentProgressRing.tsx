interface StudentProgressRingProps {
  percent: number;
  label: string;
  sublabel?: string;
  size?: number;
  compact?: boolean;
  hideLabel?: boolean;
}

export default function StudentProgressRing({
  percent,
  label,
  sublabel,
  size = 120,
  compact = false,
  hideLabel = false,
}: StudentProgressRingProps) {
  const stroke = compact ? 8 : 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  const center = size / 2;
  const fontSize = compact ? 13 : 22;

  return (
    <div
      className={`flex flex-col items-center ${compact && !hideLabel ? "gap-1 text-center" : ""} ${
        !compact ? "gap-3 text-center" : ""
      }`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="block shrink-0"
        aria-hidden
      >
        <g transform={`rotate(-90 ${center} ${center})`}>
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={stroke}
          />
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#FF5C00"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-[stroke-dashoffset] duration-700 ease-out"
          />
        </g>
        <text
          x={center}
          y={center}
          textAnchor="middle"
          dominantBaseline="central"
          fill="#F5F0E8"
          fontSize={fontSize}
          fontWeight={600}
          fontFamily="var(--font-poppins), sans-serif"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {percent}%
        </text>
      </svg>
      {compact ? (
        !hideLabel && (
          <p className="max-w-[5.5rem] text-center font-mono text-[10px] uppercase leading-tight tracking-widest text-cream">
            {label}
          </p>
        )
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
