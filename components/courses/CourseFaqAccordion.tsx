"use client";

import { useState } from "react";
import type { CourseFaqItem } from "@/lib/courses/types";
import type { Locale } from "@/lib/i18n/translations";
import { toLocaleDigits } from "@/lib/i18n/digits";
import { cn } from "@/lib/utils";
import CourseSectionCard from "./CourseSectionCard";

interface CourseFaqAccordionProps {
  id: string;
  title: string;
  items: CourseFaqItem[];
  lang: Locale;
}

export default function CourseFaqAccordion({
  id,
  title,
  items,
  lang,
}: CourseFaqAccordionProps) {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  function toggle(itemId: string) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  }

  return (
    <CourseSectionCard id={id} title={title}>
      <div className="flex flex-col gap-2">
        {items.map((item) => {
          const isOpen = openIds.has(item.id);
          return (
            <div
              key={item.id}
              className={cn(
                "border rounded-sm overflow-hidden transition-colors",
                isOpen ? "border-orange/40 bg-background/60" : "border-surface bg-background/30"
              )}
            >
              <button
                type="button"
                onClick={() => toggle(item.id)}
                className="w-full flex items-center justify-between gap-4 px-4 py-3.5 text-start hover:bg-surface/40 transition-colors"
                aria-expanded={isOpen}
              >
                <span className="type-card-body font-dm font-semibold text-cream">
                  {toLocaleDigits(item.question, lang)}
                </span>
                <span
                  className={cn(
                    "text-orange font-mono text-sm shrink-0 transition-transform",
                    isOpen && "rotate-180"
                  )}
                  aria-hidden
                >
                  ▾
                </span>
              </button>
              {isOpen && (
                <div className="px-4 pb-4 border-t border-surface/80">
                  <p className="type-card-body font-dm text-cream/90 leading-relaxed pt-3">
                    {toLocaleDigits(item.answer, lang)}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </CourseSectionCard>
  );
}
