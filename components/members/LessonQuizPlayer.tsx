"use client";

import { FormEvent, useState } from "react";
import LessonCompletionCelebration from "@/components/members/LessonCompletionCelebration";
import type { LessonQuizQuestionStudent, LessonQuizSubmitResult } from "@/lib/members/types";

interface LessonQuizPlayerProps {
  programSlug: string;
  lessonId: string;
  introHtml: string;
  questions: LessonQuizQuestionStudent[];
  certificateEnabled?: boolean;
  certificatesHref?: string;
  programCertificateHref?: string;
  celebrationLabels?: {
    title: string;
    body: string;
    bodyWithCert: string;
    rewatchHint: string;
    certificatesCta: string;
    viewCertificateCta: string;
  };
  labels: {
    submit: string;
    submitting: string;
    retake: string;
    score: string;
    passed: string;
    failed: string;
    yourAnswer: string;
    correctAnswer: string;
    selectAnswer: string;
    lockedNext: string;
  };
}

export default function LessonQuizPlayer({
  programSlug,
  lessonId,
  introHtml,
  questions,
  certificateEnabled = false,
  certificatesHref = "",
  programCertificateHref = "",
  celebrationLabels,
  labels,
}: LessonQuizPlayerProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<LessonQuizSubmitResult | null>(null);
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [issuedCertificate, setIssuedCertificate] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("");

    for (const question of questions) {
      if (!answers[question.id]) {
        setStatus(labels.selectAnswer);
        return;
      }
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/members/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          action: "submit",
          programSlug,
          lessonId,
          answers,
        }),
      });
      const data = (await res.json()) as {
        result?: LessonQuizSubmitResult;
        error?: string;
        programCompleted?: boolean;
        certificateEnabled?: boolean;
        certificate?: unknown | null;
      };
      if (!res.ok) {
        setStatus(data.error || "Could not submit quiz.");
        return;
      }
      setResult(data.result as LessonQuizSubmitResult);
      if (
        data.result?.passed &&
        data.programCompleted &&
        (data.certificateEnabled || certificateEnabled) &&
        celebrationLabels
      ) {
        setShowCelebration(true);
        setIssuedCertificate(Boolean(data.certificate));
      }
    } catch {
      setStatus("Could not submit quiz.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleRetake() {
    setAnswers({});
    setResult(null);
    setStatus("");
  }

  if (result) {
    return (
      <div className="flex flex-col gap-5 p-4 sm:p-6">
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 text-center">
          <p className="font-mono text-[10px] uppercase tracking-widest text-cream/45">
            {labels.score}
          </p>
          <p className="mt-2 font-dm text-4xl font-semibold text-cream">
            {result.correctCount}/{result.totalQuestions}
          </p>
          <p
            className={`mt-2 font-dm text-sm ${
              result.passed ? "text-emerald-300" : "text-orange"
            }`}
          >
            {result.passed ? labels.passed : labels.failed}
          </p>
          {!result.passed && (
            <p className="mt-2 font-dm text-xs text-cream/55">{labels.lockedNext}</p>
          )}
        </div>

        <ul className="flex flex-col gap-3">
          {result.results.map((item) => (
            <li
              key={item.questionId}
              className={`rounded-xl border p-4 ${
                item.isCorrect
                  ? "border-emerald-500/30 bg-emerald-500/5"
                  : "border-orange/30 bg-orange/5"
              }`}
            >
              <p className="font-dm text-sm font-semibold text-cream">{item.prompt}</p>
              {!item.isCorrect && item.selectedLabel && (
                <p className="mt-2 font-dm text-sm text-cream/60">
                  {labels.yourAnswer}:{" "}
                  <span className="line-through text-red-300">{item.selectedLabel}</span>
                </p>
              )}
              {!item.isCorrect && (
                <p className="mt-1 font-dm text-sm text-cream">
                  {labels.correctAnswer}:{" "}
                  <span className="font-semibold text-emerald-300">{item.correctLabel}</span>
                </p>
              )}
              {!item.isCorrect && item.explanation && (
                <p className="mt-2 font-dm text-xs leading-relaxed text-cream/55">
                  {item.explanation}
                </p>
              )}
            </li>
          ))}
        </ul>

        {!result.passed && (
          <button
            type="button"
            onClick={handleRetake}
            className="self-start rounded-full bg-orange px-5 py-3 font-mono text-xs uppercase tracking-widest text-background hover:bg-cream"
          >
            {labels.retake}
          </button>
        )}

        {showCelebration && celebrationLabels && certificatesHref && (
          <LessonCompletionCelebration
            title={celebrationLabels.title}
            body={
              issuedCertificate
                ? celebrationLabels.bodyWithCert
                : celebrationLabels.body
            }
            rewatchHint={celebrationLabels.rewatchHint}
            certificatesHref={certificatesHref}
            certificatesCta={celebrationLabels.certificatesCta}
            certificateHref={issuedCertificate ? programCertificateHref : null}
            viewCertificateCta={celebrationLabels.viewCertificateCta}
          />
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-4 sm:p-6">
      {introHtml.trim() && (
        <div
          className="lesson-content font-dm text-sm leading-relaxed text-cream/80"
          dangerouslySetInnerHTML={{ __html: introHtml }}
        />
      )}

      <ul className="flex flex-col gap-4">
        {questions.map((question, index) => (
          <li
            key={question.id}
            className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4"
          >
            <p className="font-dm text-sm font-semibold text-cream">
              {index + 1}. {question.prompt}
            </p>
            <div className="mt-3 flex flex-col gap-2">
              {question.options.map((option) => (
                <label
                  key={option.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors ${
                    answers[question.id] === option.id
                      ? "border-orange/50 bg-orange/10"
                      : "border-white/[0.08] hover:border-orange/30"
                  }`}
                >
                  <input
                    type="radio"
                    name={question.id}
                    value={option.id}
                    checked={answers[question.id] === option.id}
                    onChange={() =>
                      setAnswers((current) => ({ ...current, [question.id]: option.id }))
                    }
                  />
                  <span className="font-dm text-sm text-cream/85">{option.label}</span>
                </label>
              ))}
            </div>
          </li>
        ))}
      </ul>

      <button
        type="submit"
        disabled={submitting || questions.length === 0}
        className="self-start rounded-full bg-orange px-5 py-3 font-mono text-xs uppercase tracking-widest text-background hover:bg-cream disabled:opacity-50"
      >
        {submitting ? labels.submitting : labels.submit}
      </button>

      {status && (
        <p className="font-dm text-sm text-orange" role="alert">
          {status}
        </p>
      )}
    </form>
  );
}
