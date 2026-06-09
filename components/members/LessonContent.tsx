"use client";

import { useEffect, useRef } from "react";
import { sanitizeLessonHtml } from "@/lib/members/sanitize-lesson-html";

interface LessonContentProps {
  content: string;
}

export default function LessonContent({ content }: LessonContentProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const isHtml = /<\/?[a-z][\s\S]*>/i.test(content);
  const safeHtml = isHtml ? sanitizeLessonHtml(content) : "";

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !isHtml) return;

    root.querySelectorAll("pre").forEach((pre) => {
      if (pre.parentElement?.classList.contains("lesson-code-wrap")) return;

      const wrap = document.createElement("div");
      wrap.className = "lesson-code-wrap relative my-4";

      const button = document.createElement("button");
      button.type = "button";
      button.className =
        "absolute end-2 top-2 z-10 border border-orange/50 bg-background px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-orange hover:bg-orange hover:text-background";
      button.textContent = "Copy";

      const parent = pre.parentNode;
      if (!parent) return;
      parent.insertBefore(wrap, pre);
      wrap.appendChild(button);
      wrap.appendChild(pre);

      button.addEventListener("click", async () => {
        const text =
          pre.querySelector("code")?.textContent ?? pre.textContent ?? "";
        try {
          await navigator.clipboard.writeText(text.trim());
          button.textContent = "Copied!";
          window.setTimeout(() => {
            button.textContent = "Copy";
          }, 2000);
        } catch {
          button.textContent = "Failed";
        }
      });
    });
  }, [safeHtml, isHtml]);

  if (!content.trim()) return null;

  if (!isHtml) {
    return (
      <p className="mt-3 font-dm text-cream/70 whitespace-pre-wrap">{content}</p>
    );
  }

  return (
    <div
      ref={rootRef}
      className="lesson-content mt-3 font-dm text-sm leading-relaxed text-cream/80"
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}
