"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import type {
  BulkIssueCertificatesPreview,
  BulkIssueCertificatesResult,
  BulkIssueCertificateStudent,
} from "@/lib/members/types";

interface BulkIssueCertificatesModalProps {
  open: boolean;
  programId: string;
  programTitle: string;
  membersRequest: (action: string, payload?: Record<string, unknown>) => Promise<unknown>;
  onClose: () => void;
  onComplete: () => void;
}

export default function BulkIssueCertificatesModal({
  open,
  programId,
  programTitle,
  membersRequest,
  onClose,
  onComplete,
}: BulkIssueCertificatesModalProps) {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [issuing, setIssuing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<BulkIssueCertificatesPreview | null>(null);
  const [result, setResult] = useState<BulkIssueCertificatesResult | null>(null);
  const [includedStudentIds, setIncludedStudentIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setMounted(true);
  }, []);

  const pendingIdsKey = useMemo(
    () => (preview?.pendingStudents ?? []).map((student) => student.studentId).join("\0"),
    [preview?.pendingStudents]
  );

  const loadPreview = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = (await membersRequest("preview-bulk-issue-certificates", {
        programId,
      })) as { preview: BulkIssueCertificatesPreview };
      setPreview(data.preview);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load preview");
      setPreview(null);
    } finally {
      setLoading(false);
    }
  }, [membersRequest, programId]);

  useEffect(() => {
    if (!open) return;
    void loadPreview();
  }, [open, loadPreview]);

  useEffect(() => {
    if (!open) {
      setIncludedStudentIds(new Set());
      return;
    }
    if (pendingIdsKey) {
      setIncludedStudentIds(new Set(pendingIdsKey.split("\0").filter(Boolean)));
    }
  }, [open, pendingIdsKey]);

  const selectedCount = includedStudentIds.size;
  const excludedCount = (preview?.pendingStudents.length ?? 0) - selectedCount;

  function toggleIncluded(studentId: string) {
    setIncludedStudentIds((current) => {
      const next = new Set(current);
      if (next.has(studentId)) {
        next.delete(studentId);
      } else {
        next.add(studentId);
      }
      return next;
    });
  }

  function setAllIncluded(selected: boolean) {
    if (!preview?.pendingStudents.length) return;
    setIncludedStudentIds(
      selected
        ? new Set(preview.pendingStudents.map((student) => student.studentId))
        : new Set()
    );
  }

  async function handleIssue() {
    if (!preview || selectedCount === 0) return;
    setIssuing(true);
    setError(null);
    try {
      const data = (await membersRequest("bulk-issue-certificates", {
        programId,
        studentIds: Array.from(includedStudentIds),
      })) as { result: BulkIssueCertificatesResult };
      setResult(data.result);
      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bulk issue failed");
    } finally {
      setIssuing(false);
    }
  }

  function handleClose() {
    if (issuing) return;
    onClose();
  }

  if (!mounted || !open) return null;

  const title = result ? "Bulk issue complete" : "Bulk issue certificates";

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4"
      role="presentation"
      onClick={handleClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="bulk-issue-certificates-title"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto border border-orange/30 bg-background p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div id="bulk-issue-certificates-title">
            <p className="font-mono text-[10px] uppercase tracking-widest text-orange">
              {programTitle}
            </p>
            <h2 className="mt-1 font-dm text-xl font-semibold text-cream">{title}</h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={issuing}
            className="font-mono text-xs uppercase tracking-widest text-cream/60 hover:text-orange disabled:opacity-40"
          >
            Close
          </button>
        </div>

        {loading && (
          <p className="mt-4 font-dm text-sm text-cream/70">Loading preview…</p>
        )}

        {error && (
          <p className="mt-4 font-dm text-sm text-red-300" role="alert">
            {error}
          </p>
        )}

        {!loading && preview && !result && (
          <div className="mt-4 space-y-4">
            {!preview.certificateEnabled ? (
              <p className="font-dm text-sm text-amber-300/90">
                Certificates are not enabled for this program. Turn them on in Member programs
                first.
              </p>
            ) : (
              <>
                <div className="grid gap-2 sm:grid-cols-3">
                  <CountPill label="Enrolled" value={preview.totalEnrolled} />
                  <CountPill label="Already issued" value={preview.alreadyIssued} />
                  <CountPill label="Will issue" value={selectedCount} accent />
                </div>

                {preview.pendingIssue > 0 && (
                  <SelectableStudentList
                    title="Select students to issue"
                    students={preview.pendingStudents}
                    includedStudentIds={includedStudentIds}
                    onToggle={toggleIncluded}
                    onSelectAll={() => setAllIncluded(true)}
                    onClearAll={() => setAllIncluded(false)}
                    excludedCount={excludedCount}
                  />
                )}

                {preview.alreadyIssued > 0 && (
                  <StudentList
                    title="Already have a certificate (skipped)"
                    items={preview.alreadyIssuedStudents.map((student) => ({
                      key: student.studentId,
                      primary: student.studentName,
                      secondary: `${student.certificateNumber} · ${student.email}`,
                    }))}
                  />
                )}

                {preview.totalEnrolled === 0 && (
                  <p className="font-dm text-sm text-cream/55">No students enrolled yet.</p>
                )}

                {preview.totalEnrolled > 0 && preview.pendingIssue === 0 && (
                  <p className="font-dm text-sm text-cream/70">
                    Everyone enrolled in this program already has an active certificate.
                  </p>
                )}
              </>
            )}

            <div className="flex flex-wrap gap-2 pt-2">
              <button
                type="button"
                onClick={() => void handleIssue()}
                disabled={
                  issuing ||
                  !preview.certificateEnabled ||
                  preview.pendingIssue === 0 ||
                  selectedCount === 0
                }
                className="bg-orange px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-background hover:bg-cream disabled:cursor-not-allowed disabled:opacity-40"
              >
                {issuing
                  ? "Issuing…"
                  : `Issue ${selectedCount} certificate${
                      selectedCount === 1 ? "" : "s"
                    }`}
              </button>
              <button
                type="button"
                onClick={handleClose}
                disabled={issuing}
                className="border border-surface px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-cream/70 hover:border-cream/50 disabled:opacity-40"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {result && (
          <div className="mt-4 space-y-4">
            <div className="grid gap-2 sm:grid-cols-3">
              <CountPill label="Issued" value={result.issued} accent />
              <CountPill label="Already had" value={result.alreadyIssued} />
              <CountPill label="Failed" value={result.failed} />
            </div>

            {result.failures.length > 0 && (
              <StudentList
                title="Could not issue"
                items={result.failures.map((student) => ({
                  key: student.studentId,
                  primary: student.studentName,
                  secondary: `${student.email} — ${student.reason}`,
                }))}
              />
            )}

            <button
              type="button"
              onClick={handleClose}
              className="bg-orange px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-background hover:bg-cream"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

function CountPill({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className="rounded border border-surface px-3 py-2">
      <p className="font-mono text-[10px] uppercase tracking-widest text-cream/45">{label}</p>
      <p
        className={`font-dm text-lg font-semibold ${
          accent ? "text-orange" : "text-cream"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function SelectableStudentList({
  title,
  students,
  includedStudentIds,
  onToggle,
  onSelectAll,
  onClearAll,
  excludedCount,
}: {
  title: string;
  students: BulkIssueCertificateStudent[];
  includedStudentIds: Set<string>;
  onToggle: (studentId: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  excludedCount: number;
}) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-mono text-[10px] uppercase tracking-widest text-cream/60">
          {title}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onSelectAll}
            className="font-mono text-[10px] uppercase tracking-widest text-orange hover:text-cream"
          >
            Select all
          </button>
          <button
            type="button"
            onClick={onClearAll}
            className="font-mono text-[10px] uppercase tracking-widest text-cream/50 hover:text-cream"
          >
            Clear
          </button>
        </div>
      </div>
      <p className="mt-2 font-dm text-xs text-cream/55">
        {includedStudentIds.size} selected
        {excludedCount > 0 ? ` · ${excludedCount} excluded` : ""}
      </p>
      <ul className="mt-3 flex max-h-52 flex-col gap-2 overflow-y-auto">
        {students.map((student) => {
          const checked = includedStudentIds.has(student.studentId);
          return (
            <li key={student.studentId}>
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
                  onChange={() => onToggle(student.studentId)}
                  className="mt-0.5"
                />
                <span className="min-w-0 flex-1">
                  <span className="block font-dm text-sm text-cream">
                    {student.studentName}
                  </span>
                  <span className="mt-0.5 block font-dm text-xs text-cream/55">
                    {student.studentNumber || "No ID"} · {student.email}
                  </span>
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function StudentList({
  title,
  items,
}: {
  title: string;
  items: Array<{ key: string; primary: string; secondary: string }>;
}) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-widest text-cream/45">{title}</p>
      <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto border border-white/[0.06] p-2">
        {items.map((item) => (
          <li key={item.key} className="font-dm text-xs text-cream/75">
            <span className="text-cream">{item.primary}</span>
            <span className="mt-0.5 block text-cream/45">{item.secondary}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
