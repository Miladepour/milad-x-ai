"use client";

import { useState } from "react";

interface BlogPromptBoxProps {
  title: string;
  text: string;
}

export default function BlogPromptBox({ title, text }: BlogPromptBoxProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="my-8 overflow-hidden rounded-sm border border-orange/30 bg-[#141414]">
      <div className="flex items-center justify-between gap-3 border-b border-surface/80 px-4 py-3">
        <p className="font-mono text-[11px] uppercase tracking-widest text-orange rtl:tracking-normal">
          {title}
        </p>
        <button
          type="button"
          onClick={() => void handleCopy()}
          className="shrink-0 rounded-sm border border-orange/50 bg-orange/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-orange transition-colors hover:bg-orange hover:text-background"
        >
          {copied ? "کپی شد ✓" : "کپی پرامپت"}
        </button>
      </div>
      <pre className="max-h-[min(70vh,520px)] overflow-auto p-4 font-mono text-sm leading-relaxed text-cream/90 whitespace-pre-wrap">
        {text}
      </pre>
    </div>
  );
}
