"use client";

import { cn } from "@/lib/utils";

export type CourseFormatFilterValue = "all" | "offline" | "online";

interface CourseFormatFilterProps {
  value: CourseFormatFilterValue;
  onChange: (value: CourseFormatFilterValue) => void;
  labels: {
    aria: string;
    all: string;
    offline: string;
    online: string;
  };
}

const OPTIONS: CourseFormatFilterValue[] = ["all", "offline", "online"];

export default function CourseFormatFilter({
  value,
  onChange,
  labels,
}: CourseFormatFilterProps) {
  return (
    <div
      role="radiogroup"
      aria-label={labels.aria}
      className="inline-flex w-full sm:w-auto border border-surface rounded-sm p-1"
    >
      {OPTIONS.map((option) => {
        const selected = value === option;
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option)}
            className={cn(
              "flex-1 sm:flex-none px-4 py-2 font-mono text-xs uppercase tracking-[0.14em] rtl:tracking-normal transition-colors rounded-[1px]",
              selected
                ? "bg-orange text-background"
                : "text-cream/60 hover:text-cream"
            )}
          >
            {labels[option]}
          </button>
        );
      })}
    </div>
  );
}
