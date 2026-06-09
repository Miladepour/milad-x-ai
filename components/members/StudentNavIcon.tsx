import type { LucideIcon } from "lucide-react";

interface StudentNavIconProps {
  icon: LucideIcon;
  active?: boolean;
}

export default function StudentNavIcon({ icon: Icon, active = false }: StudentNavIconProps) {
  return (
    <span
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all duration-200 ${
        active
          ? "border-orange/40 bg-gradient-to-br from-orange/30 via-orange/15 to-orange/5 text-orange shadow-[0_0_24px_rgba(255,92,0,0.2)]"
          : "border-white/[0.08] bg-white/[0.04] text-cream/55 group-hover:border-white/[0.14] group-hover:bg-white/[0.07] group-hover:text-cream/85"
      }`}
      aria-hidden
    >
      <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
    </span>
  );
}
