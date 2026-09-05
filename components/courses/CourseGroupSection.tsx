import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface CourseGroupSectionProps {
  title: string;
  description: string;
  headingLevel?: "h2" | "h3";
  className?: string;
  icon?: LucideIcon;
  children: ReactNode;
}

export default function CourseGroupSection({
  title,
  description,
  headingLevel = "h2",
  className = "",
  icon: Icon,
  children,
}: CourseGroupSectionProps) {
  const Heading = headingLevel;

  return (
    <section className={`flex flex-col gap-6 ${className}`.trim()}>
      <header className="max-w-2xl">
        <div className="flex items-center gap-2.5 mb-2">
          {Icon ? (
            <Icon className="h-5 w-5 shrink-0 text-orange" strokeWidth={1.75} aria-hidden />
          ) : null}
          <Heading className="type-course-section-heading font-dm font-bold text-cream m-0">
            {title}
          </Heading>
        </div>
        <p className="type-section-body font-dm text-cream/80 leading-relaxed m-0">
          {description}
        </p>
      </header>
      {children}
    </section>
  );
}
