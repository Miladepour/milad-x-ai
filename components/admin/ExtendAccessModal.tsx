"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  computeExtendedEndDate,
  type ExtendAccessMode,
} from "@/lib/members/extend-access";
import { formatDateOnly } from "@/lib/members/dates";

export interface ExtendAccessPreviewRow {
  id: string;
  label: string;
  currentEndsAt: string | null;
}

export interface ExtendAccessConfirmPayload {
  mode: ExtendAccessMode;
  days: number;
  endDate: string;
  enrollmentIds?: string[];
}

interface ExtendAccessModalProps {
  open: boolean;
  title: string;
  programTitle: string;
  studentLabel?: string;
  currentEndsAt?: string | null;
  previewRows?: ExtendAccessPreviewRow[];
  confirming?: boolean;
  onClose: () => void;
  onConfirm: (payload: ExtendAccessConfirmPayload) => void;
}

function formatExpiry(iso: string | null | undefined): string {
  if (!iso) return "No expiry";
  return formatDateOnly(iso);
}

export default function ExtendAccessModal({
  open,
  title,
  programTitle,
  studentLabel,
  currentEndsAt = null,
  previewRows,
  confirming = false,
  onClose,
  onConfirm,
}: ExtendAccessModalProps) {
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<ExtendAccessMode>("days");
  const [days, setDays] = useState("7");
  const [endDate, setEndDate] = useState("");
  const [step, setStep] = useState<"edit" | "confirm">("edit");
  const [includedIds, setIncludedIds] = useState<Set<string>>(new Set());
  const wasOpenRef = useRef(false);

  const parsedDays = Number(days);
  const isBulk = Boolean(previewRows && previewRows.length > 0);

  const previewRowIdsKey = useMemo(
    () => (previewRows ?? []).map((row) => row.id).join("\0"),
    [previewRows]
  );

  const includedRows = useMemo(() => {
    if (!previewRows?.length) return [];
    return previewRows.filter((row) => includedIds.has(row.id));
  }, [previewRows, includedIds]);

  const previewChanges = useMemo(() => {
    if (!includedRows.length) return [];
    const daysValue = Number.isFinite(parsedDays) ? parsedDays : 0;
    return includedRows.map((row) => ({
      ...row,
      newEndDate: computeExtendedEndDate({
        mode,
        accessEndsAt: row.currentEndsAt,
        days: daysValue,
        endDate,
      }),
    }));
  }, [includedRows, mode, parsedDays, endDate]);

  const singleNewEndDate = useMemo(() => {
    if (isBulk) return null;
    const daysValue = Number.isFinite(parsedDays) ? parsedDays : 0;
    return computeExtendedEndDate({
      mode,
      accessEndsAt: currentEndsAt,
      days: daysValue,
      endDate,
    });
  }, [isBulk, mode, parsedDays, endDate, currentEndsAt]);

  const validationError = useMemo(() => {
    if (mode === "days") {
      if (!Number.isFinite(parsedDays) || parsedDays <= 0) {
        return "Enter a positive number of days.";
      }
    } else if (!endDate.trim()) {
      return "Choose a new end date.";
    }

    if (isBulk) {
      if (includedRows.length === 0) {
        return "Select at least one student to extend.";
      }
      if (previewChanges.some((row) => !row.newEndDate)) {
        return "Could not compute the new end date for every selected student.";
      }
      return null;
    }

    if (!singleNewEndDate) {
      return "Could not compute the new end date.";
    }
    return null;
  }, [mode, parsedDays, endDate, isBulk, includedRows.length, previewChanges, singleNewEndDate]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const justOpened = open && !wasOpenRef.current;
    wasOpenRef.current = open;

    if (!open) {
      setMode("days");
      setDays("7");
      setEndDate("");
      setStep("edit");
      setIncludedIds(new Set());
      return;
    }

    if (justOpened && previewRowIdsKey) {
      setIncludedIds(new Set(previewRowIdsKey.split("\0").filter(Boolean)));
    }
  }, [open, previewRowIdsKey]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!open || event.key !== "Escape" || confirming) return;
      onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, confirming, onClose]);

  function toggleIncluded(id: string) {
    setIncludedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function setAllIncluded(selected: boolean) {
    if (!previewRows?.length) return;
    setIncludedIds(
      selected ? new Set(previewRows.map((row) => row.id)) : new Set()
    );
  }

  function handleReview() {
    if (validationError) return;
    setStep("confirm");
  }

  function handleConfirm() {
    if (validationError) return;
    onConfirm({
      mode,
      days: Number.isFinite(parsedDays) ? parsedDays : 0,
      endDate,
      enrollmentIds: isBulk ? includedRows.map((row) => row.id) : undefined,
    });
  }

  if (!open || !mounted) return null;

  const excludedCount = (previewRows?.length ?? 0) - includedRows.length;

  const modal = (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-background/85 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="extend-access-title"
      onClick={() => {
        if (!confirming) onClose();
      }}
    >
      <div
        className="flex max-h-[min(90vh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-white/[0.1] bg-surface shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="shrink-0 border-b border-white/[0.08] p-5 pb-4">
          <p
            id="extend-access-title"
            className="font-mono text-xs uppercase tracking-widest text-orange"
          >
            {title}
          </p>
          <div className="mt-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 font-dm text-sm text-cream/80">
            <p>
              <span className="text-cream/50">Program:</span> {programTitle}
            </p>
            {studentLabel && (
              <p className="mt-1">
                <span className="text-cream/50">Student:</span> {studentLabel}
              </p>
            )}
            {!isBulk && (
              <p className="mt-1">
                <span className="text-cream/50">Current expiry:</span>{" "}
                {formatExpiry(currentEndsAt)}
              </p>
            )}
            {isBulk && previewRows && (
              <p className="mt-1">
                <span className="text-cream/50">Selected:</span> {includedRows.length} of{" "}
                {previewRows.length} students
                {excludedCount > 0 ? ` (${excludedCount} excluded)` : ""}
              </p>
            )}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5 pt-4">
          {step === "edit" ? (
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setMode("days")}
                  className={`rounded-full px-4 py-2 font-mono text-[10px] uppercase tracking-widest transition-colors ${
                    mode === "days"
                      ? "bg-orange text-background"
                      : "border border-white/[0.1] text-cream/70 hover:border-orange"
                  }`}
                >
                  Add days
                </button>
                <button
                  type="button"
                  onClick={() => setMode("date")}
                  className={`rounded-full px-4 py-2 font-mono text-[10px] uppercase tracking-widest transition-colors ${
                    mode === "date"
                      ? "bg-orange text-background"
                      : "border border-white/[0.1] text-cream/70 hover:border-orange"
                  }`}
                >
                  Set end date
                </button>
              </div>

              {mode === "days" ? (
                <label className="flex flex-col gap-1 font-dm text-xs text-cream/70">
                  Extend by (days)
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={days}
                    onChange={(e) => setDays(e.target.value)}
                    className="form-field"
                    placeholder="e.g. 7"
                  />
                </label>
              ) : (
                <label className="flex flex-col gap-1 font-dm text-xs text-cream/70">
                  New expiry date
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="form-field"
                  />
                </label>
              )}

              {isBulk && previewRows && (
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-cream/60">
                      Students in this program
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setAllIncluded(true)}
                        className="font-mono text-[10px] uppercase tracking-widest text-orange hover:text-cream"
                      >
                        Select all
                      </button>
                      <button
                        type="button"
                        onClick={() => setAllIncluded(false)}
                        className="font-mono text-[10px] uppercase tracking-widest text-cream/50 hover:text-cream"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                  <ul className="mt-3 flex max-h-52 flex-col gap-2 overflow-y-auto">
                    {previewRows.map((row) => {
                      const checked = includedIds.has(row.id);
                      return (
                        <li key={row.id}>
                          <label
                            className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                              checked
                                ? "border-orange/30 bg-orange/5"
                                : "border-white/[0.06] bg-white/[0.02] opacity-70"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleIncluded(row.id)}
                              className="mt-0.5"
                            />
                            <span className="min-w-0 flex-1">
                              <span className="block font-dm text-sm text-cream">{row.label}</span>
                              <span className="mt-0.5 block font-dm text-xs text-cream/55">
                                Expires: {formatExpiry(row.currentEndsAt)}
                              </span>
                            </span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {validationError && (
                <p className="font-dm text-sm text-amber-300/90">{validationError}</p>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <p className="font-dm text-sm text-cream/80">
                Please confirm this access extension. Only{" "}
                <strong className="text-cream">{programTitle}</strong> is affected
                {studentLabel ? ` for ${studentLabel}` : ""}.
              </p>

              {!isBulk && singleNewEndDate && (
                <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-4 font-dm text-sm text-cream">
                  <p>
                    <span className="text-cream/50">Current expiry:</span>{" "}
                    {formatExpiry(currentEndsAt)}
                  </p>
                  <p className="mt-2">
                    <span className="text-cream/50">New expiry:</span>{" "}
                    {formatDateOnly(singleNewEndDate + "T12:00:00")}
                  </p>
                  {mode === "days" && (
                    <p className="mt-1 text-cream/60">+{parsedDays} days</p>
                  )}
                </div>
              )}

              {isBulk && (
                <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-4">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-emerald-300/90">
                    {previewChanges.length} student{previewChanges.length === 1 ? "" : "s"} will
                    be extended
                  </p>
                  {excludedCount > 0 && (
                    <p className="mt-1 font-dm text-xs text-cream/55">
                      {excludedCount} student{excludedCount === 1 ? "" : "s"} excluded
                    </p>
                  )}
                  <ul className="mt-3 flex max-h-52 flex-col gap-2 overflow-y-auto">
                    {previewChanges.map((row) => (
                      <li key={row.id} className="font-dm text-xs text-cream/80">
                        <p className="text-cream">{row.label}</p>
                        <p className="text-cream/60">
                          {formatExpiry(row.currentEndsAt)} →{" "}
                          {row.newEndDate
                            ? formatDateOnly(row.newEndDate + "T12:00:00")
                            : "—"}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-white/[0.08] p-5 pt-4">
          {step === "edit" ? (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleReview}
                disabled={Boolean(validationError)}
                className="bg-orange px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-background hover:bg-cream disabled:opacity-50"
              >
                Review change
              </button>
              <button
                type="button"
                onClick={onClose}
                className="border border-white/[0.12] px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-cream hover:border-orange"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleConfirm}
                disabled={confirming || Boolean(validationError)}
                className="bg-orange px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-background hover:bg-cream disabled:opacity-50"
              >
                {confirming ? "Extending…" : "Confirm extend"}
              </button>
              <button
                type="button"
                onClick={() => setStep("edit")}
                disabled={confirming}
                className="border border-white/[0.12] px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-cream hover:border-orange disabled:opacity-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={confirming}
                className="border border-white/[0.12] px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-cream hover:border-orange disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
