"use client";

import { useState } from "react";
import type { StructureModule } from "@/lib/courses/sections";
import type { Locale } from "@/lib/i18n/translations";
import { toLocaleDigits } from "@/lib/i18n/digits";
import { cn } from "@/lib/utils";
import CourseSectionCard from "./CourseSectionCard";

interface CourseStructureAccordionProps {
  id: string;
  title: string;
  meta: string;
  modules: StructureModule[];
  lang: Locale;
  expandAllLabel: string;
  collapseAllLabel: string;
}

export default function CourseStructureAccordion({
  id,
  title,
  meta,
  modules,
  lang,
  expandAllLabel,
  collapseAllLabel,
}: CourseStructureAccordionProps) {
  const [openIds, setOpenIds] = useState<Set<string>>(
    () => new Set(modules.length > 0 ? [modules[0].id] : [])
  );

  const allOpen = openIds.size === modules.length;

  function toggle(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (allOpen) setOpenIds(new Set());
    else setOpenIds(new Set(modules.map((m) => m.id)));
  }

  return (
    <CourseSectionCard
      id={id}
      title={title}
      meta={toLocaleDigits(meta, lang)}
      action={
        <button
          type="button"
          onClick={toggleAll}
          className="font-mono text-xs text-orange hover:text-cream transition-colors shrink-0"
        >
          {allOpen ? collapseAllLabel : expandAllLabel}
        </button>
      }
    >
      <div className="flex flex-col gap-2">
        {modules.map((module) => {
          const isOpen = openIds.has(module.id);
          return (
            <div
              key={module.id}
              className={cn(
                "border rounded-sm overflow-hidden transition-colors",
                isOpen ? "border-orange/40 bg-background/60" : "border-surface bg-background/30"
              )}
            >
              <button
                type="button"
                onClick={() => toggle(module.id)}
                className="w-full flex items-center justify-between gap-4 px-4 py-3.5 text-start hover:bg-surface/40 transition-colors"
                aria-expanded={isOpen}
              >
                <span className="type-card-body font-dm font-semibold text-cream">
                  {toLocaleDigits(module.title, lang)}
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
                <div className="px-4 pb-4 border-t border-surface/80 space-y-2">
                  {module.lines.map((line) => (
                    <p
                      key={line}
                      className="type-card-body font-dm text-cream/90 leading-relaxed"
                    >
                      {toLocaleDigits(line, lang)}
                    </p>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </CourseSectionCard>
  );
}
