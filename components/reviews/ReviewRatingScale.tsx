import { cn } from "@/lib/utils";

const ORANGE_RGB = "255, 92, 0";

function ratingFillAlpha(value: number, selected: boolean): number {
  const step = [0.08, 0.16, 0.28, 0.44, 0.72];
  const base = step[value - 1] ?? 0.08;
  if (selected) {
    const selectedStep = [0.5, 0.58, 0.68, 0.82, 1];
    return selectedStep[value - 1] ?? 0.5;
  }
  return base;
}

function ratingBorderAlpha(value: number, selected: boolean): number {
  const step = [0.18, 0.28, 0.4, 0.58, 0.85];
  const base = step[value - 1] ?? 0.18;
  return selected ? Math.min(base + 0.12, 1) : base;
}

function ratingTextClass(value: number, selected: boolean): string {
  if (selected) return "text-white";
  if (value >= 4) return "text-cream";
  if (value >= 3) return "text-cream/90";
  return "text-cream/65";
}

interface ReviewRatingCircleProps {
  value: number;
  selected: boolean;
  onSelect: () => void;
  ariaLabel: string;
}

export default function ReviewRatingCircle({
  value,
  selected,
  onSelect,
  ariaLabel,
}: ReviewRatingCircleProps) {
  const fillAlpha = ratingFillAlpha(value, selected);
  const borderAlpha = ratingBorderAlpha(value, selected);
  const isFull = selected && value === 5;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={ariaLabel}
      style={{
        backgroundColor: isFull
          ? "#FF5C00"
          : `rgba(${ORANGE_RGB}, ${fillAlpha})`,
        borderColor: selected
          ? "#FF5C00"
          : `rgba(${ORANGE_RGB}, ${borderAlpha})`,
      }}
      className={cn(
        "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 font-dm text-sm font-semibold transition-all duration-200",
        ratingTextClass(value, selected),
        selected
          ? "scale-110 shadow-[0_0_0_3px_rgba(255,92,0,0.22)]"
          : "hover:scale-105 hover:border-orange/50"
      )}
    >
      {value}
    </button>
  );
}

interface ReviewRatingRowProps {
  question: string;
  value: number | undefined;
  onChange: (value: number) => void;
}

export function ReviewRatingRow({ question, value, onChange }: ReviewRatingRowProps) {
  return (
    <div className="space-y-3 text-center">
      <p className="font-dm text-base text-cream leading-snug">{question}</p>
      <div className="flex items-center justify-center gap-2 sm:gap-3">
        {[1, 2, 3, 4, 5].map((ratingValue) => (
          <ReviewRatingCircle
            key={ratingValue}
            value={ratingValue}
            selected={value === ratingValue}
            onSelect={() => onChange(ratingValue)}
            ariaLabel={`${question}: ${ratingValue}`}
          />
        ))}
      </div>
    </div>
  );
}
