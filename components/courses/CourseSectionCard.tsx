import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CourseSectionCardProps {
  id?: string;
  title: string;
  meta?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function CourseSectionCard({
  id,
  title,
  meta,
  action,
  children,
  className,
}: CourseSectionCardProps) {
  return (
    <section
      id={id}
      className={cn(
        "border border-surface bg-surface/30 rounded-sm overflow-hidden",
        id && "scroll-mt-36",
        className
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-4 px-5 py-4 md:px-6 md:py-5 border-b border-surface">
        <div>
          <h2 className="type-course-section-heading font-dm font-bold text-cream">
            {title}
          </h2>
          {meta && (
            <p className="type-card-body font-dm text-cream/70 mt-1">{meta}</p>
          )}
        </div>
        {action}
      </div>
      <div className="px-5 py-5 md:px-6 md:py-6">{children}</div>
    </section>
  );
}
