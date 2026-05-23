"use client";

import type { Locale } from "@/lib/i18n/translations";
import { cn } from "@/lib/utils";

export interface CourseSectionNavLink {
  id: string;
  label: string;
}

interface CourseSectionNavProps {
  links: CourseSectionNavLink[];
  ariaLabel: string;
  lang: Locale;
}

export default function CourseSectionNav({
  links,
  ariaLabel,
  lang,
}: CourseSectionNavProps) {
  if (links.length === 0) return null;

  return (
    <nav
      aria-label={ariaLabel}
      className="sticky top-20 z-30 border-b border-surface bg-background/95 backdrop-blur-md"
    >
      <div
        dir={lang === "FA" ? "rtl" : "ltr"}
        className={cn(
          "w-full overflow-x-auto overflow-y-hidden overscroll-x-contain",
          "touch-pan-x [-webkit-overflow-scrolling:touch]",
          "scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        )}
      >
        <ul
          className={cn(
            "inline-flex flex-nowrap items-center gap-1 py-3",
            "px-4 sm:px-6 md:px-12 lg:px-16",
            "md:max-w-7xl md:mx-auto",
            "min-w-min w-max max-w-none"
          )}
        >
          {links.map((link) => (
            <li key={link.id} className="shrink-0 flex-none">
              <a
                href={`#${link.id}`}
                className={cn(
                  "inline-block font-dm text-sm whitespace-nowrap px-3.5 py-2 rounded-sm",
                  "text-orange border border-transparent",
                  "hover:text-cream hover:border-orange/30 hover:bg-surface/40",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/60",
                  "transition-colors"
                )}
              >
                {link.label}
              </a>
            </li>
          ))}
          {/* trailing space so last link can scroll fully into view */}
          <li className="shrink-0 w-4 flex-none md:w-0" aria-hidden />
        </ul>
      </div>
    </nav>
  );
}
