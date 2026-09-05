import Link from "next/link";
import { cn } from "@/lib/utils";

export interface PageBreadcrumbItem {
  label: string;
  href?: string;
}

interface PageBreadcrumbProps {
  items: PageBreadcrumbItem[];
  ariaLabel: string;
  variant?: "default" | "hero";
  className?: string;
}

export default function PageBreadcrumb({
  items,
  ariaLabel,
  variant = "default",
  className,
}: PageBreadcrumbProps) {
  const linkClass = "hover:text-cream transition-colors";
  const mutedClass = variant === "hero" ? "text-cream/70" : "text-muted";

  return (
    <nav aria-label={ariaLabel} className={cn(mutedClass, className)}>
      <ol className="flex flex-wrap items-center gap-2 text-sm font-dm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2 min-w-0">
              {index > 0 ? <span aria-hidden>/</span> : null}
              {item.href && !isLast ? (
                <Link href={item.href} className={linkClass}>
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn("min-w-0 line-clamp-1", isLast ? "text-orange" : undefined)}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
