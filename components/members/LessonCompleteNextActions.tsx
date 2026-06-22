"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import LessonCompletionCelebration from "@/components/members/LessonCompletionCelebration";
import { useTranslation } from "@/lib/i18n/useTranslation";

const NEXT_FILL_MS = 700;

interface LessonCompleteNextActionsProps {
  lessonId: string;
  completed?: boolean;
  nextHref?: string | null;
  certificateEnabled?: boolean;
  certificatesHref?: string;
  programCertificateHref?: string;
  progressHint?: string;
}

function NextLessonButton({
  href,
  label,
  ready,
  filling,
}: {
  href: string;
  label: string;
  ready: boolean;
  filling: boolean;
}) {
  const [fillActive, setFillActive] = useState(false);
  const base =
    "relative inline-flex min-w-[7.5rem] items-center justify-center overflow-hidden rounded-full px-5 py-2.5 font-mono text-xs uppercase tracking-widest";

  useEffect(() => {
    if (!filling) {
      setFillActive(false);
      return;
    }
    setFillActive(false);
    const frame = requestAnimationFrame(() => setFillActive(true));
    return () => cancelAnimationFrame(frame);
  }, [filling]);

  if (ready) {
    return (
      <Link
        href={href}
        className={`${base} bg-orange text-background transition-colors hover:bg-cream`}
      >
        {label}
      </Link>
    );
  }

  return (
    <span
      className={`${base} bg-white/10 text-cream/40`}
      aria-disabled="true"
    >
      <span
        className={`absolute inset-0 origin-left bg-orange transition-transform ease-out ${
          filling ? "duration-700" : "duration-0"
        }`}
        style={{ transform: fillActive ? "scaleX(1)" : "scaleX(0)" }}
        aria-hidden
      />
      <span
        className={`relative z-10 transition-colors duration-500 ${
          filling ? "text-background" : "text-cream/40"
        }`}
      >
        {label}
      </span>
    </span>
  );
}

export default function LessonCompleteNextActions({
  lessonId,
  completed = false,
  nextHref = null,
  certificateEnabled = false,
  certificatesHref = "",
  programCertificateHref = "",
  progressHint,
}: LessonCompleteNextActionsProps) {
  const t = useTranslation();
  const [isComplete, setIsComplete] = useState(completed);
  const [status, setStatus] = useState("");
  const [showCelebration, setShowCelebration] = useState(false);
  const [issuedCertificate, setIssuedCertificate] = useState(false);
  const [nextReady, setNextReady] = useState(completed && !!nextHref);
  const [nextFilling, setNextFilling] = useState(false);
  const wasCompletedRef = useRef(completed);

  const unlockNext = useCallback(() => {
    if (!nextHref || nextReady) return;
    setNextFilling(true);
    window.setTimeout(() => {
      setNextReady(true);
      setNextFilling(false);
    }, NEXT_FILL_MS);
  }, [nextHref, nextReady]);

  useEffect(() => {
    if (!completed) return;
    setIsComplete(true);
    if (!nextHref || nextReady || nextFilling) return;
    if (wasCompletedRef.current) {
      setNextReady(true);
      return;
    }
    unlockNext();
  }, [completed, nextHref, nextReady, nextFilling, unlockNext]);

  useEffect(() => {
    wasCompletedRef.current = completed;
  }, [completed]);

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
      unlockNext();
      if (data.programCompleted && (data.certificateEnabled || certificateEnabled)) {
        setShowCelebration(true);
        setIssuedCertificate(Boolean(data.certificate));
      }
    } catch {
      setStatus("Could not save progress.");
    }
  }, [certificateEnabled, lessonId, unlockNext]);

  const hint = progressHint ?? t.memberPortal.progressHintText;

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

        {nextHref ? (
          <NextLessonButton
            href={nextHref}
            label={t.memberPortal.next}
            ready={nextReady}
            filling={nextFilling}
          />
        ) : null}

        {status ? <p className="font-dm text-sm text-orange">{status}</p> : null}
        {!isComplete && !status ? (
          <p className="font-dm text-xs text-cream/50">{hint}</p>
        ) : null}
      </div>

      {showCelebration && certificatesHref ? (
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
      ) : null}
    </>
  );
}

export { NextLessonButton, NEXT_FILL_MS };
