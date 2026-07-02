"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import HoneypotField from "@/components/shared/HoneypotField";
import TurnstileWidget from "@/components/shared/TurnstileWidget";
import { useLanguage } from "@/lib/i18n/context";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { resolveReviewProgramTitle } from "@/lib/members/program-localized";
import {
  REVIEW_RATING_KEYS,
  type ProgramReviewRatings,
  type ReviewRatingKey,
} from "@/lib/reviews/ratings";
import type { ReviewProgramOption } from "@/lib/reviews/types";
import { ReviewRatingRow } from "@/components/reviews/ReviewRatingScale";

const turnstileRequired = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim());

type WizardStep = "program" | "rating" | "name" | "public" | "private" | "done";

type PartialRatings = Partial<Record<ReviewRatingKey, number>>;

interface ReviewWizardProps {
  initialProgram?: ReviewProgramOption | null;
}

function isRatingsComplete(ratings: PartialRatings): ratings is ProgramReviewRatings {
  return REVIEW_RATING_KEYS.every((key) => {
    const value = ratings[key];
    return typeof value === "number" && value >= 1 && value <= 5;
  });
}

export default function ReviewWizard({ initialProgram = null }: ReviewWizardProps) {
  const { lang, href } = useLanguage();
  const t = useTranslation();
  const p = t.reviewPage;

  const [programs, setPrograms] = useState<ReviewProgramOption[]>(
    initialProgram ? [initialProgram] : []
  );
  const [programsLoading, setProgramsLoading] = useState(!initialProgram);
  const [programId, setProgramId] = useState(initialProgram?.id ?? "");
  const [step, setStep] = useState<WizardStep>(initialProgram ? "rating" : "program");
  const [ratings, setRatings] = useState<PartialRatings>({});
  const [reviewerName, setReviewerName] = useState("");
  const [publicReview, setPublicReview] = useState("");
  const [privateReview, setPrivateReview] = useState("");
  const [consentPublicDisplay, setConsentPublicDisplay] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");

  useEffect(() => {
    if (initialProgram) return;

    let cancelled = false;
    async function loadPrograms() {
      setProgramsLoading(true);
      try {
        const res = await fetch("/api/reviews");
        const data = await res.json();
        if (!res.ok) throw new Error("load failed");
        if (!cancelled) {
          setPrograms(data.programs ?? []);
        }
      } catch {
        if (!cancelled) setErrorMessage(p.errorGeneric);
      } finally {
        if (!cancelled) setProgramsLoading(false);
      }
    }

    void loadPrograms();
    return () => {
      cancelled = true;
    };
  }, [initialProgram, p.errorGeneric]);

  const selectedProgram = useMemo(() => {
    return programs.find((item) => item.id === programId) ?? initialProgram ?? null;
  }, [programs, programId, initialProgram]);

  const programTitle = useMemo(() => {
    if (!selectedProgram) return "";
    return resolveReviewProgramTitle(selectedProgram, lang);
  }, [selectedProgram, lang]);

  const steps: WizardStep[] = initialProgram
    ? ["rating", "name", "public", "private", "done"]
    : ["program", "rating", "name", "public", "private", "done"];

  const stepIndex = steps.indexOf(step);
  const progress = step === "done" ? 100 : Math.round((stepIndex / (steps.length - 1)) * 100);

  function setRating(key: ReviewRatingKey, value: number) {
    setRatings((current) => ({ ...current, [key]: value }));
  }

  function goNext() {
    setErrorMessage("");
    if (step === "program") {
      if (!programId) {
        setErrorMessage(p.selectProgram);
        return;
      }
      setStep("rating");
      return;
    }
    if (step === "rating") {
      if (!isRatingsComplete(ratings)) {
        setErrorMessage(p.selectRating);
        return;
      }
      setStep("name");
      return;
    }
    if (step === "name") {
      if (reviewerName.trim().length < 2) {
        setErrorMessage(p.invalidName);
        return;
      }
      setStep("public");
      return;
    }
    if (step === "public") {
      if (publicReview.trim().length < 10) {
        setErrorMessage(p.publicReviewTooShort);
        return;
      }
      setStep("private");
    }
  }

  function goBack() {
    setErrorMessage("");
    if (step === "rating") setStep(initialProgram ? "rating" : "program");
    else if (step === "name") setStep("rating");
    else if (step === "public") setStep("name");
    else if (step === "private") setStep("public");
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (step !== "private") return;
    if (!programId || !isRatingsComplete(ratings)) return;
    if (turnstileRequired && !turnstileToken) return;

    setStatus("loading");
    setErrorMessage("");
    const formData = new FormData(e.currentTarget);
    const website = String(formData.get("website") ?? "");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          programId,
          reviewerName: reviewerName.trim(),
          ratings,
          publicReview: publicReview.trim(),
          privateReview: privateReview.trim(),
          locale: lang,
          consentPublicDisplay,
          website,
          turnstileToken: turnstileToken || undefined,
        }),
      });

      if (!res.ok) throw new Error("submit failed");
      setStep("done");
      setStatus("idle");
    } catch {
      setStatus("error");
      setErrorMessage(p.errorGeneric);
    }
  }

  if (step === "done") {
    return (
      <div className="bg-surface border border-orange/30 rounded-sm p-6 sm:p-8 text-center">
        <h2 className="font-dm text-lg font-semibold text-cream mb-3">
          {p.successTitle}
        </h2>
        <p className="font-dm text-sm text-cream/80 leading-relaxed mb-6">
          {p.successMessage}
        </p>
        <Link
          href={href("/")}
          className="inline-flex font-mono text-xs text-orange hover:text-cream transition-colors"
        >
          {p.backHome}
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <div className="h-1 w-full rounded-full bg-surface overflow-hidden">
          <div
            className="h-full bg-orange transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-cream/55 text-center">
          {p.stepLabel.replace("{current}", String(stepIndex + 1)).replace("{total}", String(steps.length - 1))}
        </p>
      </div>

      {selectedProgram && step !== "program" && (
        <p className="mb-4 font-dm text-xs text-cream/75 text-center">
          {p.programLabel}: <span className="text-cream">{programTitle}</span>
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <HoneypotField />

        {step === "program" && (
          <div className="space-y-2">
            <label className="block font-dm text-sm text-cream">{p.chooseProgram}</label>
            {programsLoading ? (
              <p className="font-dm text-sm text-cream/70">{p.loadingPrograms}</p>
            ) : programs.length === 0 ? (
              <p className="font-dm text-sm text-cream/70">{p.noPrograms}</p>
            ) : (
              <select
                value={programId}
                onChange={(event) => setProgramId(event.target.value)}
                className="form-field text-sm"
              >
                <option value="">{p.programPlaceholder}</option>
                {programs.map((program) => (
                  <option key={program.id} value={program.id}>
                    {resolveReviewProgramTitle(program, lang)}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {step === "rating" && (
          <div className="space-y-5">
            <div className="text-center">
              <h2 className="font-dm text-base font-semibold text-cream">
                {p.ratingTitle}
              </h2>
              <p className="mt-1.5 font-dm text-sm text-cream/70">{p.ratingHint}</p>
            </div>

            <div className="space-y-6">
              {REVIEW_RATING_KEYS.map((key) => (
                <ReviewRatingRow
                  key={key}
                  question={p.ratingQuestions[key]}
                  value={ratings[key]}
                  onChange={(ratingValue) => setRating(key, ratingValue)}
                />
              ))}
            </div>
          </div>
        )}

        {step === "name" && (
          <div className="space-y-2">
            <label htmlFor="reviewer-name" className="block font-dm text-sm text-cream">
              {p.nameLabel}
            </label>
            <input
              id="reviewer-name"
              value={reviewerName}
              onChange={(event) => setReviewerName(event.target.value)}
              className="form-field text-sm"
              placeholder={p.namePlaceholder}
              autoComplete="name"
            />
          </div>
        )}

        {step === "public" && (
          <div className="space-y-2">
            <label htmlFor="public-review" className="block font-dm text-sm text-cream">
              {p.publicReviewLabel}
            </label>
            <p className="font-dm text-xs text-cream/70">{p.publicReviewHint}</p>
            <textarea
              id="public-review"
              value={publicReview}
              onChange={(event) => setPublicReview(event.target.value)}
              className="form-field min-h-[120px] resize-y text-sm"
              placeholder={p.publicReviewPlaceholder}
            />
          </div>
        )}

        {step === "private" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="private-review" className="block font-dm text-sm text-cream">
                {p.privateReviewLabel}
              </label>
              <p className="font-dm text-xs text-cream/70">{p.privateReviewHint}</p>
              <textarea
                id="private-review"
                value={privateReview}
                onChange={(event) => setPrivateReview(event.target.value)}
                className="form-field min-h-[100px] resize-y text-sm"
                placeholder={p.privateReviewPlaceholder}
              />
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={consentPublicDisplay}
                onChange={(event) => setConsentPublicDisplay(event.target.checked)}
                className="mt-0.5 shrink-0"
              />
              <span className="font-dm text-xs text-cream/80 leading-relaxed">
                {p.consentLabel}
              </span>
            </label>

            <TurnstileWidget
              onToken={setTurnstileToken}
              onExpire={() => setTurnstileToken("")}
            />
          </div>
        )}

        {errorMessage && (
          <p className="font-dm text-xs text-red-400 text-center" role="alert">
            {errorMessage}
          </p>
        )}

        <div className="flex flex-wrap justify-center gap-3 pt-2">
          {step !== "program" && !(step === "rating" && initialProgram) && (
            <button
              type="button"
              onClick={goBack}
              className="rounded-full border border-orange/50 px-5 py-3 font-mono text-xs uppercase tracking-widest text-orange transition-colors hover:bg-orange hover:text-background"
            >
              {p.back}
            </button>
          )}

          {step === "private" ? (
            <button
              type="submit"
              disabled={status === "loading" || (turnstileRequired && !turnstileToken)}
              className="bg-orange px-6 py-3 font-mono text-xs uppercase tracking-widest text-background transition-colors hover:bg-cream disabled:cursor-not-allowed disabled:opacity-50"
            >
              {status === "loading" ? p.submitting : p.submit}
            </button>
          ) : (
            <button
              type="button"
              onClick={goNext}
              disabled={step === "program" && (programsLoading || programs.length === 0)}
              className="bg-orange px-6 py-3 font-mono text-xs uppercase tracking-widest text-background transition-colors hover:bg-cream disabled:cursor-not-allowed disabled:opacity-50"
            >
              {p.next}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
