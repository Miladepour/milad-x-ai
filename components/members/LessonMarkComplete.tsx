"use client";

import { useCallback, useState } from "react";
import LessonCompletionCelebration from "@/components/members/LessonCompletionCelebration";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface LessonMarkCompleteProps {
  lessonId: string;
  completed?: boolean;
  certificateEnabled?: boolean;
  certificatesHref?: string;
  programCertificateHref?: string;
}

export default function LessonMarkComplete({
  lessonId,
  completed = false,
  certificateEnabled = false,
  certificatesHref = "",
  programCertificateHref = "",
}: LessonMarkCompleteProps) {
  const t = useTranslation();
  const [isComplete, setIsComplete] = useState(completed);
  const [status, setStatus] = useState("");
  const [showCelebration, setShowCelebration] = useState(false);
  const [issuedCertificate, setIssuedCertificate] = useState(false);

  const markComplete = useCallback(async () => {
    setStatus("");
    try {
      const res = await fetch("/api/members/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ lessonId, completed: true }),
      });
      const data = (await res.json()) as {
        programCompleted?: boolean;
        certificateEnabled?: boolean;
        certificate?: unknown | null;
      };
      if (!res.ok) throw new Error("Save failed");
      setIsComplete(true);
      if (data.programCompleted && (data.certificateEnabled || certificateEnabled)) {
        setShowCelebration(true);
        setIssuedCertificate(Boolean(data.certificate));
      }
    } catch {
      setStatus("Could not save progress.");
    }
  }, [certificateEnabled, lessonId]);

  return (
    <>
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
      {showCelebration && certificatesHref && (
        <div className="px-4 pb-4 sm:px-5">
          <LessonCompletionCelebration
            title={t.memberPortal.programCompletedTitle}
            body={
              issuedCertificate
                ? t.memberPortal.programCompletedBodyWithCert
                : t.memberPortal.programCompletedBody
            }
            rewatchHint={t.memberPortal.programCompletedRewatchHint}
            certificatesHref={certificatesHref}
            certificatesCta={t.memberPortal.programCompletedCertificatesCta}
            certificateHref={issuedCertificate ? programCertificateHref : null}
            viewCertificateCta={t.memberPortal.certificateView}
          />
        </div>
      )}
    </>
  );
}
