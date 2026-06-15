import { Award } from "lucide-react";

interface StudentCertificateBadgeProps {
  label: string;
  className?: string;
  variant?: "default" | "cover";
}

export default function StudentCertificateBadge({
  label,
  className = "",
  variant = "default",
}: StudentCertificateBadgeProps) {
  const variantClass =
    variant === "cover"
      ? "border-white/25 bg-black/55 text-cream shadow-[0_2px_12px_rgba(0,0,0,0.35)] backdrop-blur-sm"
      : "border-orange/35 bg-orange/10 text-orange";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest ${variantClass} ${className}`.trim()}
    >
      <Award className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
      {label}
    </span>
  );
}
