interface StudentProgressRingProps {
  percent: number;
  label: string;
  sublabel?: string;
  size?: number;
}

export default function StudentProgressRing({
  percent,
  label,
  sublabel,
  size = 120,
}: StudentProgressRingProps) {
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3 text-center">
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
          <span className="font-dm text-2xl font-semibold text-cream">{percent}%</span>
        </div>
      </div>
      <div>
        <p className="font-dm text-sm font-medium text-cream">{label}</p>
        {sublabel && <p className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-cream/45">{sublabel}</p>}
      </div>
    </div>
  );
}
