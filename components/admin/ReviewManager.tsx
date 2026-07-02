"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { SITE_URL } from "@/lib/i18n/config";
import { localizedPath } from "@/lib/i18n/paths";
import { resolveProgramTitle } from "@/lib/members/program-localized";
import type { MemberProgram } from "@/lib/members/types";
import type { ProgramReview, ProgramReviewStatus } from "@/lib/reviews/types";
import {
  averageReviewRating,
  REVIEW_RATING_ADMIN_QUESTIONS,
  REVIEW_RATING_KEYS,
} from "@/lib/reviews/ratings";

interface ReviewManagerProps {
  reviewsRequest: (action: string, payload?: Record<string, unknown>) => Promise<unknown>;
  membersRequest: (action: string, payload?: Record<string, unknown>) => Promise<unknown>;
  onStatus: (message: string, tone?: "success" | "error" | "info") => void;
}

type ManagerMode = "collect" | "inbox";

const STATUS_OPTIONS: { value: ProgramReviewStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "published", label: "Published" },
  { value: "rejected", label: "Rejected" },
];

const BTN_PRIMARY =
  "bg-orange px-5 py-3 font-mono text-xs uppercase tracking-widest text-background transition-colors hover:bg-cream disabled:cursor-not-allowed disabled:opacity-50";

const BTN_OUTLINE =
  "rounded-full border border-orange/50 px-5 py-3 font-mono text-xs uppercase tracking-widest text-orange transition-colors hover:bg-orange hover:text-background disabled:cursor-not-allowed disabled:opacity-50";

export default function ReviewManager({
  reviewsRequest,
  membersRequest,
  onStatus,
}: ReviewManagerProps) {
  const [mode, setMode] = useState<ManagerMode>("collect");
  const [programs, setPrograms] = useState<MemberProgram[]>([]);
  const [programsLoading, setProgramsLoading] = useState(true);
  const [programId, setProgramId] = useState("");
  const [inviteLocale, setInviteLocale] = useState<"EN" | "FA">("EN");
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [recipientCount, setRecipientCount] = useState(0);

  const [reviews, setReviews] = useState<ProgramReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [filterProgramId, setFilterProgramId] = useState("");
  const [filterStatus, setFilterStatus] = useState<ProgramReviewStatus | "">("");
  const [filterLocale, setFilterLocale] = useState<"EN" | "FA" | "">("");
  const [openReviewId, setOpenReviewId] = useState<string | null>(null);

  const selectedProgram = useMemo(
    () => programs.find((program) => program.id === programId) ?? null,
    [programs, programId]
  );

  const reviewUrl = useMemo(() => {
    if (!selectedProgram) return "";
    const urlLocale = inviteLocale === "FA" ? "fa" : "en";
    return `${SITE_URL}${localizedPath(`/review/${selectedProgram.slug}`, urlLocale)}`;
  }, [inviteLocale, selectedProgram]);

  const loadPrograms = useCallback(async () => {
    setProgramsLoading(true);
    try {
      const data = (await membersRequest("list-programs")) as {
        programs: MemberProgram[];
      };
      setPrograms(data.programs ?? []);
    } catch (err) {
      onStatus(err instanceof Error ? err.message : "Could not load programs", "error");
    } finally {
      setProgramsLoading(false);
    }
  }, [membersRequest, onStatus]);

  const loadReviews = useCallback(async () => {
    setReviewsLoading(true);
    try {
      const data = (await reviewsRequest("list-reviews", {
        programId: filterProgramId || undefined,
        status: filterStatus || undefined,
        locale: filterLocale || undefined,
      })) as { reviews: ProgramReview[] };
      setReviews(data.reviews ?? []);
    } catch (err) {
      onStatus(err instanceof Error ? err.message : "Could not load reviews", "error");
    } finally {
      setReviewsLoading(false);
    }
  }, [filterLocale, filterProgramId, filterStatus, onStatus, reviewsRequest]);

  useEffect(() => {
    void loadPrograms();
  }, [loadPrograms]);

  useEffect(() => {
    if (mode === "inbox") {
      void loadReviews();
    }
  }, [loadReviews, mode]);

  async function copyReviewLink() {
    if (!reviewUrl) {
      onStatus("Select a program first.");
      return;
    }
    try {
      await navigator.clipboard.writeText(reviewUrl);
      setCopied(true);
      onStatus("Review link copied.", "success");
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      onStatus("Could not copy link.", "error");
    }
  }

  async function prepareEmailSend(e?: FormEvent) {
    e?.preventDefault();
    if (!programId) {
      onStatus("Select a program first.");
      return;
    }

    setSending(true);
    try {
      const data = (await reviewsRequest("preview-review-invite", {
        programId,
        previewLocale: inviteLocale,
      })) as {
        recipientCount: number;
      };

      if (data.recipientCount === 0) {
        onStatus("No enrolled students for this program.");
        return;
      }

      setRecipientCount(data.recipientCount);
      setConfirmOpen(true);
    } catch (err) {
      onStatus(err instanceof Error ? err.message : "Could not prepare email", "error");
    } finally {
      setSending(false);
    }
  }

  async function executeEmailSend() {
    setConfirmOpen(false);
    setSending(true);
    onStatus(`Sending review invite to ${recipientCount} student${recipientCount === 1 ? "" : "s"}…`);
    try {
      const result = (await reviewsRequest("send-review-invite", {
        programId,
        inviteLocale,
      })) as { sent: number; failed: number; total: number };

      if (result.failed > 0) {
        onStatus(
          `Sent ${result.sent} of ${result.total}. ${result.failed} failed.`,
          "error"
        );
      } else {
        onStatus(`Review invite sent to ${result.sent} student${result.sent === 1 ? "" : "s"}.`, "success");
      }
    } catch (err) {
      onStatus(err instanceof Error ? err.message : "Send failed", "error");
    } finally {
      setSending(false);
    }
  }

  async function updateReviewStatus(reviewId: string, status: ProgramReviewStatus) {
    try {
      await reviewsRequest("update-review-status", { reviewId, status });
      onStatus(`Review marked as ${status}.`, "success");
      await loadReviews();
    } catch (err) {
      onStatus(err instanceof Error ? err.message : "Could not update review", "error");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setMode("collect")}
          className={`rounded-full px-4 py-2 font-mono text-xs uppercase tracking-widest transition-colors ${
            mode === "collect"
              ? "bg-orange text-background"
              : "border border-white/[0.1] text-cream/70 hover:border-orange hover:text-orange"
          }`}
        >
          Collect
        </button>
        <button
          type="button"
          onClick={() => setMode("inbox")}
          className={`rounded-full px-4 py-2 font-mono text-xs uppercase tracking-widest transition-colors ${
            mode === "inbox"
              ? "bg-orange text-background"
              : "border border-white/[0.1] text-cream/70 hover:border-orange hover:text-orange"
          }`}
        >
          Inbox
        </button>
      </div>

      {mode === "collect" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="student-glass p-6 space-y-5">
            <div>
              <h2 className="font-dm text-xl font-semibold text-cream">Share a review link</h2>
              <p className="mt-2 font-dm text-sm text-cream/70">
                Generate a public link students can open without logging in.
              </p>
            </div>

            <label className="block space-y-2">
              <span className="font-dm text-sm text-cream">Program</span>
              <select
                value={programId}
                onChange={(event) => setProgramId(event.target.value)}
                className="form-field"
                disabled={programsLoading}
              >
                <option value="">Select program</option>
                {programs
                  .filter((program) => program.status === "published")
                  .map((program) => (
                    <option key={program.id} value={program.id}>
                      {program.titleEn || program.titleFa || program.title}
                    </option>
                  ))}
              </select>
            </label>

            <div className="space-y-2">
              <span className="block font-dm text-sm text-cream">Invite language</span>
              <div className="flex gap-2">
                {(["EN", "FA"] as const).map((locale) => (
                  <button
                    key={locale}
                    type="button"
                    onClick={() => setInviteLocale(locale)}
                    className={`rounded-full px-4 py-2 font-mono text-xs uppercase tracking-widest transition-colors ${
                      inviteLocale === locale
                        ? "bg-orange text-background"
                        : "border border-white/[0.1] text-cream/70 hover:border-orange hover:text-orange"
                    }`}
                  >
                    {locale === "EN" ? "English" : "Farsi"}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <span className="block font-dm text-sm text-cream">Review URL</span>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  readOnly
                  value={reviewUrl}
                  className="form-field flex-1"
                  placeholder="Select a program to generate a link"
                />
                <button
                  type="button"
                  onClick={() => void copyReviewLink()}
                  disabled={!reviewUrl}
                  className={BTN_OUTLINE}
                >
                  {copied ? "Copied" : "Copy link"}
                </button>
              </div>
            </div>
          </section>

          <section className="student-glass p-6 space-y-5">
            <div>
              <h2 className="font-dm text-xl font-semibold text-cream">Email program students</h2>
              <p className="mt-2 font-dm text-sm text-cream/70">
                Send a review invite to all enrolled students of the selected program.
              </p>
            </div>

            {selectedProgram && (
              <p className="font-dm text-sm text-cream/80">
                Program:{" "}
                <span className="text-cream">
                  {resolveProgramTitle(selectedProgram, inviteLocale)}
                </span>
              </p>
            )}

            <p className="font-dm text-sm text-cream/70">
              Email language: <span className="text-cream">{inviteLocale === "FA" ? "Farsi" : "English"}</span>
            </p>

            <form onSubmit={prepareEmailSend}>
              <button
                type="submit"
                disabled={!programId || sending}
                className={BTN_PRIMARY}
              >
                {sending ? "Preparing…" : "Send review invite"}
              </button>
            </form>
          </section>
        </div>
      )}

      {mode === "inbox" && (
        <div className="flex flex-col gap-5">
          <div className="student-glass grid gap-3 md:grid-cols-4">
            <select
              value={filterProgramId}
              onChange={(event) => setFilterProgramId(event.target.value)}
              className="form-field"
            >
              <option value="">All programs</option>
              {programs.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.titleEn || program.titleFa || program.title}
                </option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(event) =>
                setFilterStatus(event.target.value as ProgramReviewStatus | "")
              }
              className="form-field"
            >
              <option value="">All statuses</option>
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              value={filterLocale}
              onChange={(event) =>
                setFilterLocale(event.target.value as "EN" | "FA" | "")
              }
              className="form-field"
            >
              <option value="">All languages</option>
              <option value="EN">English</option>
              <option value="FA">Farsi</option>
            </select>
            <button
              type="button"
              onClick={() => void loadReviews()}
              className={BTN_OUTLINE}
              disabled={reviewsLoading}
            >
              {reviewsLoading ? "Loading…" : "Refresh"}
            </button>
          </div>

          {reviewsLoading && reviews.length === 0 ? (
            <p className="student-glass p-8 font-dm text-cream/70">Loading reviews…</p>
          ) : reviews.length === 0 ? (
            <p className="student-glass p-8 font-dm text-cream/70">No reviews yet.</p>
          ) : (
            <ul className="grid gap-4">
              {reviews.map((review) => {
                const isOpen = openReviewId === review.id;
                const averageScore = averageReviewRating(review.ratings);

                return (
                  <li key={review.id} className="student-glass-strong student-glass !p-0">
                    <div className="p-5">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-dm text-xl font-semibold text-cream">
                              {review.reviewerName}
                            </h3>
                            <span className="rounded-full border border-cream/20 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-cream/70">
                              {review.status}
                            </span>
                          </div>
                          <p className="mt-1 font-dm text-sm text-cream/70">
                            {review.programTitle} · {review.locale}
                          </p>
                        </div>
                        <time className="font-mono text-xs text-orange shrink-0">
                          {new Date(review.submittedAt).toLocaleString()}
                        </time>
                      </div>

                      <div className="mt-4 border-t border-surface pt-4 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-mono text-[10px] uppercase tracking-widest text-orange">
                            Ratings
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <span className="rounded-full bg-orange/20 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-orange">
                              Overall: {review.ratings.overall}/5
                            </span>
                            <span className="rounded-full border border-orange/30 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-cream/80">
                              Average: {averageScore}/5
                            </span>
                          </div>
                        </div>

                        {!review.detailedRatingsAvailable && (
                          <p className="font-dm text-xs text-cream/60">
                            Legacy review: only an overall score was recorded. Per-question
                            breakdown is not available.
                          </p>
                        )}

                        <ul className="space-y-2">
                          {REVIEW_RATING_KEYS.map((key) => (
                            <li
                              key={key}
                              className="flex flex-col gap-1 border border-surface bg-background/30 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                            >
                              <p className="font-dm text-sm text-cream/85 leading-snug">
                                {REVIEW_RATING_ADMIN_QUESTIONS[key]}
                              </p>
                              <span className="font-dm text-sm font-semibold text-orange shrink-0">
                                {review.detailedRatingsAvailable || key === "overall"
                                  ? `${review.ratings[key]}/5`
                                  : "N/A"}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <button
                        type="button"
                        onClick={() => setOpenReviewId(isOpen ? null : review.id)}
                        className="mt-4 flex w-full items-center justify-between border-t border-surface pt-4 text-left transition-colors hover:text-orange"
                        aria-expanded={isOpen}
                      >
                        <span className="font-mono text-[10px] uppercase tracking-widest text-cream/70">
                          {isOpen ? "Hide review text" : "Show review text and actions"}
                        </span>
                        <span className="font-mono text-lg text-orange">
                          {isOpen ? "-" : "+"}
                        </span>
                      </button>
                    </div>

                    {isOpen && (
                      <div className="border-t border-surface p-5 space-y-4">
                        <div className="grid gap-3 md:grid-cols-2">
                          <div className="border border-surface bg-background/40 p-4 md:col-span-2">
                            <p className="font-mono text-[10px] uppercase tracking-widest text-orange mb-2">
                              Public review
                            </p>
                            <p className="whitespace-pre-wrap font-dm text-sm text-cream">
                              {review.publicReview}
                            </p>
                          </div>
                          {review.privateReview && (
                            <div className="border border-surface bg-background/40 p-4 md:col-span-2">
                              <p className="font-mono text-[10px] uppercase tracking-widest text-orange mb-2">
                                Private review
                              </p>
                              <p className="whitespace-pre-wrap font-dm text-sm text-cream">
                                {review.privateReview}
                              </p>
                            </div>
                          )}
                          <div className="border border-surface bg-background/40 p-4">
                            <p className="font-mono text-[10px] uppercase tracking-widest text-orange mb-2">
                              Consent to publish
                            </p>
                            <p className="font-dm text-sm text-cream">
                              {review.consentPublicDisplay ? "Yes" : "No"}
                            </p>
                          </div>
                          <div className="border border-surface bg-background/40 p-4">
                            <p className="font-mono text-[10px] uppercase tracking-widest text-orange mb-2">
                              Source
                            </p>
                            <p className="font-dm text-sm text-cream">{review.source}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {STATUS_OPTIONS.map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() =>
                                void updateReviewStatus(review.id, option.value)
                              }
                              disabled={review.status === option.value}
                              className={BTN_OUTLINE}
                            >
                              Mark {option.label.toLowerCase()}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Send review invite?"
        description={`This will email ${recipientCount} enrolled student${recipientCount === 1 ? "" : "s"} with a link to leave a review.`}
        confirmLabel="Send emails"
        loading={sending}
        onConfirm={() => void executeEmailSend()}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
