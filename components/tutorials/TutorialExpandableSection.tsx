"use client";

import { useId, useState } from "react";

interface TutorialExpandableSectionProps {
  title: string;
  expandLabel: string;
  collapseLabel: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export default function TutorialExpandableSection({
  title,
  expandLabel,
  collapseLabel,
  children,
  defaultOpen = false,
}: TutorialExpandableSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <section className="w-full border border-surface rounded-2xl bg-surface/15 overflow-hidden transition-colors hover:border-surface/80">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 sm:px-8 md:px-12 md:py-5 text-start transition-colors hover:bg-surface/25"
      >
        <h2 className="font-dm text-base md:text-lg font-semibold text-cream leading-snug text-start flex-1">
          {title}
        </h2>
        <span className="shrink-0 font-mono text-xs text-orange tracking-widest rtl:tracking-normal">
          {open ? collapseLabel : expandLabel}
        </span>
      </button>
      <div
        id={panelId}
        hidden={!open}
        className="border-t border-surface/60 px-5 pb-5 pt-4 sm:px-8 md:px-12 md:pb-6 md:pt-5"
      >
        {children}
      </div>
    </section>
  );
}
