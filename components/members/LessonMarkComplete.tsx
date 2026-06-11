"use client";

import { useCallback, useState } from "react";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface LessonMarkCompleteProps {
  lessonId: string;
  completed?: boolean;
}

export default function LessonMarkComplete({
  lessonId,
  completed = false,
}: LessonMarkCompleteProps) {
  const t = useTranslation();
  const [isComplete, setIsComplete] = useState(completed);
  const [status, setStatus] = useState("");

  const markComplete = useCallback(async () => {
    setStatus("");
    try {
      const res = await fetch("/api/members/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ lessonId, completed: true }),
      });
      if (!res.ok) throw new Error("Save failed");
      setIsComplete(true);
    } catch {
      setStatus("Could not save progress.");
    }
  }, [lessonId]);

  return (
    <div className="flex flex-wrap items-center gap-3 border-t border-white/[0.08] px-4 py-4 sm:px-5">
      <button
        type="button"
        disabled={isComplete}
        onClick={() => void markComplete()}
        className="rounded-full border border-orange/50 px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-orange transition-colors hover:bg-orange hover:text-background disabled:opacity-50"
      >
        {isComplete ? t.memberPortal.completed : t.memberPortal.markComplete}
      </button>
      {status && <p className="font-dm text-sm text-orange">{status}</p>}
      {!isComplete && (
        <p className="font-dm text-xs text-cream/50">{t.memberPortal.progressHintText}</p>
      )}
    </div>
  );
}
