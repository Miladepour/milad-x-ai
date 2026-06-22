import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "primary" | "secondary";

const variantClasses: Record<Variant, string> = {
  primary:
    "rounded-full bg-orange px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-background transition-colors hover:bg-cream",
  secondary:
    "rounded-full border border-orange/50 px-4 py-2.5 font-mono text-xs uppercase tracking-widest text-orange transition-colors hover:bg-orange hover:text-background",
};

const disabledClasses =
  "pointer-events-none cursor-not-allowed opacity-45 saturate-50";

interface StudentPortalButtonProps {
  href: string;
  children: ReactNode;
  variant?: Variant;
  className?: string;
  external?: boolean;
  disabled?: boolean;
}

export default function StudentPortalButton({
  href,
  children,
  variant = "primary",
  className = "",
  external = false,
  disabled = false,
}: StudentPortalButtonProps) {
  const classes = `inline-flex items-center justify-center gap-2 ${variantClasses[variant]} ${disabled ? disabledClasses : ""} ${className}`;

  if (disabled) {
    return (
      <span className={classes} aria-disabled="true">
        {children}
      </span>
    );
  }

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
