interface StudentGlassCardProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  as?: "section" | "div" | "article";
  variant?: "default" | "strong" | "accent";
}

export default function StudentGlassCard({
  children,
  className = "",
  id,
  as: Tag = "section",
  variant = "default",
}: StudentGlassCardProps) {
  const variantClass =
    variant === "strong"
      ? "student-glass-strong"
      : variant === "accent"
        ? "student-glass-accent"
        : "";

  return (
    <Tag id={id} className={`student-glass ${variantClass} ${className}`.trim()}>
      {children}
    </Tag>
  );
}
