"use client";

import { FormEvent, useCallback, useMemo, useState } from "react";
import StudentEmailHistory from "@/components/admin/StudentEmailHistory";
import StudentSearchSelect from "@/components/admin/StudentSearchSelect";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import RichTextEditor from "@/components/shared/RichTextEditor";
import {
  DEFAULT_BROADCAST_BANNER_ID,
  EMAIL_BANNER_LIST,
  type EmailBannerId,
} from "@/lib/email/banners";
import type { MemberProgram, StudentProfile } from "@/lib/members/types";

interface StudentEmailComposerProps {
  membersRequest: (action: string, payload?: Record<string, unknown>) => Promise<unknown>;
  onStatus: (message: string, variant?: "success" | "error" | "info") => void;
  programs: MemberProgram[];
  students: StudentProfile[];
}

type AudienceType = "all" | "student" | "program";
type ComposerView = "compose" | "preview" | "history";

interface PreviewData {
  html: string;
  subject: string;
  recipientCount: number;
  sampleRecipient: {
    email: string;
    fullName: string;
    locale: "EN" | "FA";
  };
  recipients: {
    email: string;
    fullName: string;
    locale: "EN" | "FA";
  }[];
}

const AUDIENCE_OPTIONS: { value: AudienceType; label: string }[] = [
  { value: "all", label: "All students" },
  { value: "student", label: "One student" },
  { value: "program", label: "Program enrollment" },
];

export default function StudentEmailComposer({
  membersRequest,
  onStatus,
  programs,
  students,
}: StudentEmailComposerProps) {
  const [view, setView] = useState<ComposerView>("compose");
  const [audienceType, setAudienceType] = useState<AudienceType>("all");
  const [studentId, setStudentId] = useState("");
  const [programId, setProgramId] = useState("");
  const [previewLocale, setPreviewLocale] = useState<"EN" | "FA">("EN");
  const [subject, setSubject] = useState("");
  const [bannerId, setBannerId] = useState<EmailBannerId>(DEFAULT_BROADCAST_BANNER_ID);
  const [bodyHtml, setBodyHtml] = useState("<p></p>");
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [sending, setSending] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingRecipientCount, setPendingRecipientCount] = useState(0);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

  const audiencePayload = useMemo(() => {
    if (audienceType === "student") {
      return { audienceType, studentId };
    }
    if (audienceType === "program") {
      return { audienceType, programId };
    }
    return { audienceType: "all" as const };
  }, [audienceType, studentId, programId]);

  const canPreview = useMemo(() => {
    if (!subject.trim()) return false;
    const text = bodyHtml.replace(/<[^>]+>/g, "").trim();
    if (!text) return false;
    if (audienceType === "student" && !studentId) return false;
    if (audienceType === "program" && !programId) return false;
    return true;
  }, [subject, bodyHtml, audienceType, studentId, programId]);

  const loadPreview = useCallback(async () => {
    if (!canPreview) {
      onStatus("Add a subject, body, and audience before previewing.");
      return;
    }

    setLoadingPreview(true);
    try {
      const data = (await membersRequest("preview-student-email", {
        subject: subject.trim(),
        bodyHtml,
        bannerId,
        previewLocale,
        ...audiencePayload,
      })) as PreviewData & { ok?: boolean };

      setPreview({
        html: data.html,
        subject: data.subject,
        recipientCount: data.recipientCount,
        sampleRecipient: data.sampleRecipient,
        recipients: data.recipients,
      });
      setView("preview");
    } catch (err) {
      onStatus(err instanceof Error ? err.message : "Preview failed");
    } finally {
      setLoadingPreview(false);
    }
  }, [
    audiencePayload,
    bodyHtml,
    canPreview,
    membersRequest,
    onStatus,
    bannerId,
    previewLocale,
    subject,
  ]);

  async function requestSend(e?: FormEvent) {
    e?.preventDefault();
    if (!canPreview) {
      onStatus("Complete the email and audience before sending.");
      return;
    }

    setLoadingPreview(true);
    try {
      const data = (await membersRequest("preview-student-email", {
        subject: subject.trim(),
        bodyHtml,
        bannerId,
        previewLocale,
        ...audiencePayload,
      })) as PreviewData & { ok?: boolean };

      if (data.recipientCount === 0) {
        onStatus("No recipients selected.");
        return;
      }

      setPreview({
        html: data.html,
        subject: data.subject,
        recipientCount: data.recipientCount,
        sampleRecipient: data.sampleRecipient,
        recipients: data.recipients,
      });
      setPendingRecipientCount(data.recipientCount);
      setConfirmOpen(true);
    } catch (err) {
      onStatus(err instanceof Error ? err.message : "Could not prepare send");
    } finally {
      setLoadingPreview(false);
    }
  }

  async function executeSend() {
    const count = pendingRecipientCount;
    setConfirmOpen(false);
    setSending(true);
    onStatus(`Sending to ${count} recipient${count === 1 ? "" : "s"}…`);
    try {
      const result = (await membersRequest("send-student-email", {
        subject: subject.trim(),
        bodyHtml,
        bannerId,
        ...audiencePayload,
      })) as { sent: number; failed: number; total: number };

      if (result.failed > 0) {
        onStatus(`Sent ${result.sent} of ${result.total}. ${result.failed} failed.`, "error");
      } else {
        onStatus(`Email sent to ${result.sent} student${result.sent === 1 ? "" : "s"}.`, "success");
      }
      setHistoryRefreshKey((key) => key + 1);
      setView("history");
    } catch (err) {
      onStatus(err instanceof Error ? err.message : "Send failed", "error");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="student-section-title">Email students</p>
          <p className="mt-1 font-dm text-sm text-cream/60">
            Compose once, preview the exact email layout, then send to all students, one
            student, or everyone enrolled in a program.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setView("compose")}
            className={`rounded-full px-4 py-2 font-mono text-[10px] uppercase tracking-widest transition-colors ${
              view === "compose"
                ? "bg-orange text-background"
                : "border border-white/[0.1] text-cream/70 hover:border-orange hover:text-orange"
            }`}
          >
            Compose
          </button>
          <button
            type="button"
            onClick={() => void loadPreview()}
            disabled={!canPreview || loadingPreview}
            className={`rounded-full px-4 py-2 font-mono text-[10px] uppercase tracking-widest transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              view === "preview"
                ? "bg-orange text-background"
                : "border border-white/[0.1] text-cream/70 hover:border-orange hover:text-orange"
            }`}
          >
            {loadingPreview ? "Loading…" : "Preview"}
          </button>
          <button
            type="button"
            onClick={() => setView("history")}
            className={`rounded-full px-4 py-2 font-mono text-[10px] uppercase tracking-widest transition-colors ${
              view === "history"
                ? "bg-orange text-background"
                : "border border-white/[0.1] text-cream/70 hover:border-orange hover:text-orange"
            }`}
          >
            History
          </button>
        </div>
      </div>

      {view === "history" ? (
        <StudentEmailHistory
          membersRequest={membersRequest}
          refreshKey={historyRefreshKey}
        />
      ) : view === "compose" ? (
        <form onSubmit={(e) => void requestSend(e)} className="grid gap-4">
          <fieldset className="grid gap-3 rounded-2xl border border-white/[0.08] p-4">
            <legend className="px-1 font-mono text-[10px] uppercase tracking-widest text-orange">
              Audience
            </legend>
            <div className="flex flex-wrap gap-2">
              {AUDIENCE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setAudienceType(option.value)}
                  className={`rounded-full px-4 py-2 font-mono text-[10px] uppercase tracking-widest transition-colors ${
                    audienceType === option.value
                      ? "bg-orange text-background"
                      : "border border-white/[0.1] text-cream/70 hover:border-orange hover:text-orange"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {audienceType === "student" && (
              <StudentSearchSelect
                students={students}
                value={studentId}
                onChange={setStudentId}
              />
            )}

            {audienceType === "program" && (
              <select
                value={programId}
                onChange={(e) => setProgramId(e.target.value)}
                className="form-field max-w-xl"
                required
              >
                <option value="">Select program</option>
                {programs.map((program) => (
                  <option key={program.id} value={program.id}>
                    {program.title}
                  </option>
                ))}
              </select>
            )}
          </fieldset>

          <fieldset className="grid gap-3 rounded-2xl border border-white/[0.08] p-4">
            <legend className="px-1 font-mono text-[10px] uppercase tracking-widest text-orange">
              Header banner
            </legend>
            <p className="font-dm text-xs text-cream/55">
              Choose the illustration shown at the top of the email.
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {EMAIL_BANNER_LIST.map((banner) => {
                const selected = bannerId === banner.id;
                return (
                  <button
                    key={banner.id}
                    type="button"
                    onClick={() => setBannerId(banner.id)}
                    className={`overflow-hidden rounded-xl border text-left transition-colors ${
                      selected
                        ? "border-orange ring-1 ring-orange"
                        : "border-white/[0.1] hover:border-orange/50"
                    }`}
                  >
                    <img
                      src={banner.imagePath}
                      alt=""
                      className="block h-20 w-full object-cover"
                    />
                    <span className="block px-3 py-2 font-dm text-xs text-cream/80">
                      {banner.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <label className="flex flex-col gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-cream/45">
              Subject
            </span>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="form-field"
              placeholder="Email subject line"
              required
            />
          </label>

          <div className="flex flex-col gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-cream/45">
              Message
            </span>
            <div className="overflow-hidden rounded-sm border border-cream/30 bg-surface">
              <RichTextEditor
                value={bodyHtml}
                onChange={setBodyHtml}
                placeholder="Write your message…"
                minHeightClassName="min-h-[220px]"
                enableLink
                enableEmailButton
              />
            </div>
            <p className="font-dm text-xs text-cream/50">
              Each student receives a personalized greeting in their profile language (English
              or Farsi).
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void loadPreview()}
              disabled={!canPreview || loadingPreview}
              className="rounded-full border border-orange/50 px-5 py-3 font-mono text-xs uppercase tracking-widest text-orange transition-colors hover:bg-orange hover:text-background disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingPreview ? "Loading preview…" : "Preview email"}
            </button>
            <button
              type="submit"
              disabled={!canPreview || sending}
              className="bg-orange px-5 py-3 font-mono text-xs uppercase tracking-widest text-background transition-colors hover:bg-cream disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sending ? "Sending…" : "Send email"}
            </button>
          </div>
        </form>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-cream/50">
                Preview
              </p>
              <p className="mt-1 font-dm text-sm text-cream">
                Subject: <span className="text-orange">{preview?.subject ?? subject}</span>
              </p>
              {preview && (
                <p className="mt-1 font-dm text-xs text-cream/60">
                  Sample for {preview.sampleRecipient.fullName || preview.sampleRecipient.email}{" "}
                  ({preview.sampleRecipient.locale}) · {preview.recipientCount} recipient
                  {preview.recipientCount === 1 ? "" : "s"} total
                </p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-cream/45">
                Sample locale
              </span>
              <select
                value={previewLocale}
                onChange={(e) => setPreviewLocale(e.target.value === "FA" ? "FA" : "EN")}
                className="form-field max-w-[120px] py-2"
              >
                <option value="EN">English</option>
                <option value="FA">Farsi</option>
              </select>
              <button
                type="button"
                onClick={() => setView("compose")}
                className="rounded-full border border-white/[0.1] px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-cream/70 hover:border-orange hover:text-orange"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => void loadPreview()}
                disabled={!canPreview || loadingPreview}
                className="rounded-full bg-orange px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-background hover:bg-cream disabled:cursor-not-allowed disabled:opacity-50"
              >
                Refresh
              </button>
            </div>
          </div>

          {preview?.recipients && preview.recipients.length > 1 && (
            <div className="rounded-2xl border border-white/[0.08] p-4">
              <p className="font-mono text-[10px] uppercase tracking-widest text-cream/50">
                Recipients ({preview.recipients.length})
              </p>
              <ul className="mt-3 flex max-h-36 flex-col gap-1 overflow-y-auto font-dm text-sm text-cream/75">
                {preview.recipients.map((recipient) => (
                  <li key={recipient.email}>
                    {recipient.fullName || recipient.email} · {recipient.email} ·{" "}
                    {recipient.locale}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#F4F4F4]">
            {preview?.html ? (
              <iframe
                title="Email preview"
                srcDoc={preview.html}
                className="min-h-[720px] w-full border-0 bg-[#F4F4F4]"
                sandbox=""
              />
            ) : (
              <div className="flex min-h-[320px] items-center justify-center font-dm text-cream/50">
                {loadingPreview ? "Building preview…" : "Preview not loaded yet."}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => void requestSend()}
            disabled={!canPreview || sending || loadingPreview}
            className="self-start bg-orange px-5 py-3 font-mono text-xs uppercase tracking-widest text-background transition-colors hover:bg-cream disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending || loadingPreview
              ? "Preparing…"
              : `Send to ${preview?.recipientCount ?? 0} student${
                  preview?.recipientCount === 1 ? "" : "s"
                }`}
          </button>
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Send email?"
        description={`Send this email to ${pendingRecipientCount} student${
          pendingRecipientCount === 1 ? "" : "s"
        }? This cannot be undone.`}
        confirmLabel={`Send to ${pendingRecipientCount}`}
        cancelLabel="Cancel"
        loading={sending}
        onConfirm={() => void executeSend()}
        onCancel={() => {
          if (!sending) setConfirmOpen(false);
        }}
      />
    </div>
  );
}
