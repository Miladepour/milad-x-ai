"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import RichTextEditor from "@/components/shared/RichTextEditor";
import {
  AUDIENCE_EMAIL_BATCH_DELAY_MS,
  type AudienceEmailCampaign,
  type AudienceEmailListType,
  type AudienceEmailTemplate,
} from "@/lib/audience/email-types";
import type { StudentAudienceFilter } from "@/lib/audience/types";

interface AudienceEmailComposerProps {
  audienceRequest: (action: string, payload?: Record<string, unknown>) => Promise<unknown>;
  onStatus: (message: string, tone?: "success" | "error") => void;
  subscriberSources: string[];
  leadSources: string[];
  waitlistCourses: string[];
}

type ComposerMode = "compose" | "history";
type WizardStep = "audience" | "subject" | "message" | "preview";

interface PreviewData {
  html: string;
  subject: string;
  audienceLabel: string;
  recipientCount: number;
  sampleRecipient: {
    email: string;
    fullName: string;
    locale: "EN" | "FA";
  };
}

const LIST_OPTIONS: { value: AudienceEmailListType; label: string; hint: string }[] = [
  { value: "subscribers", label: "Subscribers", hint: "Newsletter opt-ins" },
  { value: "leads", label: "Leads", hint: "Webinar & CRM contacts" },
  { value: "waitlist", label: "Waitlist", hint: "Course waitlist signups" },
];

const STUDENT_FILTER_OPTIONS: { value: StudentAudienceFilter; label: string }[] = [
  { value: "all", label: "All contacts" },
  { value: "non-students", label: "Non-students only" },
  { value: "students", label: "Students only" },
];

const WIZARD_STEPS: { id: WizardStep; label: string }[] = [
  { id: "audience", label: "Audience" },
  { id: "subject", label: "Subject" },
  { id: "message", label: "Message" },
  { id: "preview", label: "Preview" },
];

const BTN_PRIMARY =
  "bg-orange px-5 py-3 font-mono text-xs uppercase tracking-widest text-background transition-colors hover:bg-cream disabled:cursor-not-allowed disabled:opacity-50";

const BTN_OUTLINE =
  "rounded-full border border-orange/50 px-5 py-3 font-mono text-xs uppercase tracking-widest text-orange transition-colors hover:bg-orange hover:text-background disabled:cursor-not-allowed disabled:opacity-50";

const BTN_PILL_ACTIVE = "bg-orange text-background";
const BTN_PILL_IDLE =
  "border border-white/[0.1] text-cream/70 hover:border-orange hover:text-orange";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function stepIndex(step: WizardStep): number {
  return WIZARD_STEPS.findIndex((item) => item.id === step);
}

export default function AudienceEmailComposer({
  audienceRequest,
  onStatus,
  subscriberSources,
  leadSources,
  waitlistCourses,
}: AudienceEmailComposerProps) {
  const [mode, setMode] = useState<ComposerMode>("compose");
  const [step, setStep] = useState<WizardStep>("audience");

  const [listType, setListType] = useState<AudienceEmailListType>("subscribers");
  const [sourceFilter, setSourceFilter] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [studentFilter, setStudentFilter] = useState<StudentAudienceFilter>("all");
  const [previewLocale, setPreviewLocale] = useState<"EN" | "FA">("EN");
  const [subject, setSubject] = useState("");
  const [bodyHtml, setBodyHtml] = useState("<p></p>");
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendProgress, setSendProgress] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingRecipientCount, setPendingRecipientCount] = useState(0);

  const [templates, setTemplates] = useState<AudienceEmailTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [showTemplateTools, setShowTemplateTools] = useState(false);

  const [campaigns, setCampaigns] = useState<AudienceEmailCampaign[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [expandedCampaignId, setExpandedCampaignId] = useState<string | null>(null);

  const audiencePayload = useMemo(
    () => ({
      listType,
      source: sourceFilter,
      courseSlug: courseFilter,
      studentFilter,
    }),
    [courseFilter, listType, sourceFilter, studentFilter]
  );

  const sourceOptions =
    listType === "subscribers"
      ? subscriberSources
      : listType === "leads"
        ? leadSources
        : [];

  const hasSubject = Boolean(subject.trim());
  const hasBody = Boolean(bodyHtml.replace(/<[^>]+>/g, "").trim());
  const progressPercent = ((stepIndex(step) + 1) / WIZARD_STEPS.length) * 100;

  const loadTemplates = useCallback(async () => {
    try {
      const data = (await audienceRequest("list-audience-email-templates")) as {
        templates: AudienceEmailTemplate[];
      };
      setTemplates(data.templates ?? []);
    } catch {
      setTemplates([]);
    }
  }, [audienceRequest]);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const data = (await audienceRequest("list-audience-email-history")) as {
        campaigns: AudienceEmailCampaign[];
      };
      setCampaigns(data.campaigns ?? []);
    } catch (err) {
      onStatus(err instanceof Error ? err.message : "Could not load history", "error");
      setCampaigns([]);
    } finally {
      setHistoryLoading(false);
    }
  }, [audienceRequest, onStatus]);

  useEffect(() => {
    void loadTemplates();
  }, [loadTemplates]);

  useEffect(() => {
    if (mode === "history") {
      void loadHistory();
    }
  }, [loadHistory, mode]);

  async function uploadImage(file: File): Promise<string> {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/admin-upload", { method: "POST", body: form });
    const data = (await res.json()) as { url?: string; error?: string };
    if (!res.ok || !data.url) {
      throw new Error(data.error || "Image upload failed");
    }
    return data.url;
  }

  async function loadPreview(): Promise<PreviewData | null> {
    if (!hasSubject || !hasBody) {
      onStatus("Add a subject and message before continuing.");
      return null;
    }

    setLoadingPreview(true);
    try {
      const data = (await audienceRequest("preview-audience-email", {
        subject: subject.trim(),
        bodyHtml,
        previewLocale,
        ...audiencePayload,
      })) as PreviewData;

      setPreview(data);
      return data;
    } catch (err) {
      onStatus(err instanceof Error ? err.message : "Preview failed", "error");
      return null;
    } finally {
      setLoadingPreview(false);
    }
  }

  async function goToStep(next: WizardStep) {
    if (next === "preview") {
      const data = await loadPreview();
      if (!data) return;
    }
    setStep(next);
  }

  function goBack() {
    const index = stepIndex(step);
    if (index <= 0) return;
    setStep(WIZARD_STEPS[index - 1].id);
  }

  async function requestSend() {
    if (!preview) {
      const data = await loadPreview();
      if (!data || data.recipientCount === 0) {
        onStatus(data ? "No recipients selected." : "Could not prepare send.");
        return;
      }
      setPendingRecipientCount(data.recipientCount);
      setConfirmOpen(true);
      return;
    }

    if (preview.recipientCount === 0) {
      onStatus("No recipients selected.");
      return;
    }

    setPendingRecipientCount(preview.recipientCount);
    setConfirmOpen(true);
  }

  async function executeSend() {
    const count = pendingRecipientCount;
    setConfirmOpen(false);
    setSending(true);
    setSendProgress(`Preparing send to ${count} recipient${count === 1 ? "" : "s"}…`);

    try {
      const start = (await audienceRequest("start-audience-email-campaign", {
        subject: subject.trim(),
        bodyHtml,
        ...audiencePayload,
      })) as { campaignId: string; recipientCount: number };

      let pending = start.recipientCount;
      let sent = 0;
      let failed = 0;

      while (pending > 0) {
        setSendProgress(`Sending… ${sent + failed} of ${start.recipientCount} (${pending} left)`);

        const batch = (await audienceRequest("send-audience-email-batch", {
          campaignId: start.campaignId,
        })) as {
          sent: number;
          failed: number;
          pending: number;
          sentThisBatch: number;
        };

        sent = batch.sent;
        failed = batch.failed;
        pending = batch.pending;

        if (batch.sentThisBatch === 0 && pending > 0) {
          throw new Error("Batch send stalled. Check RESEND_API_KEY and try again.");
        }

        if (pending > 0) {
          setSendProgress(
            `Waiting before next batch… ${sent + failed} of ${start.recipientCount} processed`
          );
          await sleep(AUDIENCE_EMAIL_BATCH_DELAY_MS);
        }
      }

      if (failed > 0) {
        onStatus(`Sent ${sent} of ${start.recipientCount}. ${failed} failed.`, "error");
      } else {
        onStatus(`Email sent to ${sent} recipient${sent === 1 ? "" : "s"}.`, "success");
      }

      setSendProgress("");
      setMode("history");
      await loadHistory();
    } catch (err) {
      onStatus(err instanceof Error ? err.message : "Send failed", "error");
      setSendProgress("");
    } finally {
      setSending(false);
    }
  }

  async function handleSaveTemplate() {
    const name = templateName.trim() || subject.trim();
    if (!name) {
      onStatus("Add a template name or subject first.");
      return;
    }

    setSavingTemplate(true);
    try {
      const data = (await audienceRequest("save-audience-email-template", {
        id: selectedTemplateId || undefined,
        name,
        subject: subject.trim(),
        bodyHtml,
      })) as { template: AudienceEmailTemplate };

      setSelectedTemplateId(data.template.id);
      setTemplateName(data.template.name);
      onStatus("Template saved.", "success");
      await loadTemplates();
    } catch (err) {
      onStatus(err instanceof Error ? err.message : "Could not save template", "error");
    } finally {
      setSavingTemplate(false);
    }
  }

  function applyTemplate(templateId: string) {
    const template = templates.find((item) => item.id === templateId);
    if (!template) return;
    setSelectedTemplateId(template.id);
    setTemplateName(template.name);
    setSubject(template.subject);
    setBodyHtml(template.bodyHtml || "<p></p>");
  }

  function startNewEmail() {
    setStep("audience");
    setPreview(null);
    setMode("compose");
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="student-section-title">Send email</p>
          <p className="mt-1 font-dm text-sm text-cream/60">
            Step-by-step: pick audience, write your message, preview, then send.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={startNewEmail}
            className={`rounded-full px-4 py-2 font-mono text-[10px] uppercase tracking-widest transition-colors ${
              mode === "compose" ? BTN_PILL_ACTIVE : BTN_PILL_IDLE
            }`}
          >
            New email
          </button>
          <button
            type="button"
            onClick={() => setMode("history")}
            className={`rounded-full px-4 py-2 font-mono text-[10px] uppercase tracking-widest transition-colors ${
              mode === "history" ? BTN_PILL_ACTIVE : BTN_PILL_IDLE
            }`}
          >
            History
          </button>
        </div>
      </div>

      {sending && sendProgress && (
        <p className="student-glass-pill border-orange/25 px-4 py-3 font-dm text-sm text-cream/80">
          {sendProgress}
        </p>
      )}

      {mode === "compose" && (
        <div className="student-glass flex min-h-[min(72vh,680px)] flex-col overflow-hidden !p-0">
          <div className="border-b border-surface px-6 py-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="font-mono text-[10px] uppercase tracking-widest text-orange">
                Step {stepIndex(step) + 1} of {WIZARD_STEPS.length} · {WIZARD_STEPS[stepIndex(step)].label}
              </p>
              <div className="hidden gap-2 sm:flex">
                {WIZARD_STEPS.map((item, index) => (
                  <span
                    key={item.id}
                    className={`h-1.5 w-6 rounded-full transition-colors ${
                      index <= stepIndex(step) ? "bg-orange" : "bg-white/10"
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-orange transition-all duration-300 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="flex flex-1 flex-col px-6 py-8">
            {step === "audience" && (
              <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-8">
                <div>
                  <h2 className="font-display text-2xl text-cream sm:text-3xl">
                    Who should receive this email?
                  </h2>
                  <p className="mt-2 font-dm text-sm text-cream/55">
                    Choose a list and optional filters. Only active subscribers are included.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-cream/45">
                    List
                  </span>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {LIST_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setListType(option.value);
                          setSourceFilter("");
                          setCourseFilter("");
                        }}
                        className={`rounded-xl border px-4 py-4 text-left transition-colors ${
                          listType === option.value
                            ? "border-orange bg-orange/10 ring-1 ring-orange"
                            : "border-white/[0.1] hover:border-orange/50"
                        }`}
                      >
                        <span className="block font-dm text-sm font-medium text-cream">
                          {option.label}
                        </span>
                        <span className="mt-1 block font-dm text-xs text-cream/50">
                          {option.hint}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-cream/45">
                    Student filter
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {STUDENT_FILTER_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setStudentFilter(option.value)}
                        className={`rounded-full px-4 py-2 font-mono text-[10px] uppercase tracking-widest transition-colors ${
                          studentFilter === option.value ? BTN_PILL_ACTIVE : BTN_PILL_IDLE
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {listType === "waitlist" ? (
                  <label className="flex flex-col gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-cream/45">
                      Course (optional)
                    </span>
                    <select
                      value={courseFilter}
                      onChange={(e) => setCourseFilter(e.target.value)}
                      className="form-field"
                    >
                      <option value="">All courses</option>
                      {waitlistCourses.map((course) => (
                        <option key={course} value={course}>
                          {course}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <label className="flex flex-col gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-cream/45">
                      Source (optional)
                    </span>
                    <select
                      value={sourceFilter}
                      onChange={(e) => setSourceFilter(e.target.value)}
                      className="form-field"
                    >
                      <option value="">All sources</option>
                      {sourceOptions.map((source) => (
                        <option key={source} value={source}>
                          {source}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </div>
            )}

            {step === "subject" && (
              <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-8">
                <div>
                  <h2 className="font-display text-2xl text-cream sm:text-3xl">
                    What&apos;s the subject line?
                  </h2>
                  <p className="mt-2 font-dm text-sm text-cream/55">
                    This appears in the inbox — keep it clear and specific.
                  </p>
                </div>

                <label className="flex flex-col gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-cream/45">
                    Subject
                  </span>
                  <input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="form-field text-base"
                    placeholder="Email subject"
                    autoFocus
                  />
                </label>

                <div className="flex flex-col gap-3">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-cream/45">
                    Greeting language in preview
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {(["EN", "FA"] as const).map((locale) => (
                      <button
                        key={locale}
                        type="button"
                        onClick={() => setPreviewLocale(locale)}
                        className={`rounded-full px-4 py-2 font-mono text-[10px] uppercase tracking-widest transition-colors ${
                          previewLocale === locale ? BTN_PILL_ACTIVE : BTN_PILL_IDLE
                        }`}
                      >
                        {locale === "EN" ? "English" : "Farsi"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === "message" && (
              <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6">
                <div>
                  <h2 className="font-display text-2xl text-cream sm:text-3xl">
                    Write your message
                  </h2>
                  <p className="mt-2 font-dm text-sm text-cream/55">
                    Each recipient gets a personalized greeting in their profile language.
                  </p>
                </div>

                <div className="overflow-hidden rounded-sm border border-cream/20 bg-surface">
                  <RichTextEditor
                    value={bodyHtml}
                    onChange={setBodyHtml}
                    onImageUpload={uploadImage}
                    placeholder="Write your email…"
                    minHeightClassName="min-h-[220px]"
                  />
                </div>

                <div className="rounded-xl border border-white/[0.08] bg-white/[0.02]">
                  <button
                    type="button"
                    onClick={() => setShowTemplateTools((open) => !open)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-orange"
                  >
                    Templates
                    <span className="text-cream/45">{showTemplateTools ? "−" : "+"}</span>
                  </button>
                  {showTemplateTools && (
                    <div className="space-y-3 border-t border-white/[0.08] px-4 py-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                        <label className="min-w-0 flex-1 font-dm text-xs text-cream/70">
                          Load template
                          <select
                            value={selectedTemplateId}
                            onChange={(e) => {
                              const id = e.target.value;
                              setSelectedTemplateId(id);
                              if (id) applyTemplate(id);
                            }}
                            className="form-field mt-1"
                          >
                            <option value="">Choose a saved template</option>
                            {templates.map((template) => (
                              <option key={template.id} value={template.id}>
                                {template.name}
                              </option>
                            ))}
                          </select>
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTemplateId("");
                            setTemplateName("");
                            setSubject("");
                            setBodyHtml("<p></p>");
                          }}
                          className={BTN_OUTLINE}
                        >
                          Clear
                        </button>
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                        <label className="min-w-0 flex-1 font-dm text-xs text-cream/70">
                          Save as template
                          <input
                            value={templateName}
                            onChange={(e) => setTemplateName(e.target.value)}
                            className="form-field mt-1"
                            placeholder="Template name"
                          />
                        </label>
                        <button
                          type="button"
                          disabled={savingTemplate || !subject.trim()}
                          onClick={() => void handleSaveTemplate()}
                          className={`${BTN_OUTLINE} shrink-0`}
                        >
                          {savingTemplate ? "Saving…" : "Save"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === "preview" && preview && (
              <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-5">
                <div>
                  <h2 className="font-display text-2xl text-cream sm:text-3xl">
                    Review before sending
                  </h2>
                  <p className="mt-2 font-dm text-sm text-cream/55">
                    This is how your email will look. Confirm recipients, then send.
                  </p>
                </div>

                <div className="grid gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 sm:grid-cols-2">
                  <p className="font-dm text-sm text-cream/75">
                    <span className="text-cream/45">Recipients:</span>{" "}
                    <span className="font-medium text-orange">{preview.recipientCount}</span>
                  </p>
                  <p className="font-dm text-sm text-cream/75">
                    <span className="text-cream/45">Audience:</span> {preview.audienceLabel}
                  </p>
                  <p className="font-dm text-sm text-cream/75 sm:col-span-2">
                    <span className="text-cream/45">Sample:</span> {preview.sampleRecipient.fullName}{" "}
                    ({preview.sampleRecipient.email})
                  </p>
                  <p className="font-dm text-sm font-medium text-cream sm:col-span-2">
                    {preview.subject}
                  </p>
                </div>

                <div className="overflow-hidden rounded-sm border border-surface bg-white">
                  <iframe
                    title="Email preview"
                    srcDoc={preview.html}
                    className="h-[min(48vh,480px)] w-full"
                    sandbox=""
                  />
                </div>
              </div>
            )}

            {step === "preview" && !preview && loadingPreview && (
              <p className="mx-auto font-dm text-sm text-cream/60">Loading preview…</p>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-surface px-6 py-4">
            <button
              type="button"
              onClick={goBack}
              disabled={stepIndex(step) === 0 || sending || loadingPreview}
              className={BTN_OUTLINE}
            >
              Back
            </button>

            {step === "audience" && (
              <button type="button" onClick={() => void goToStep("subject")} className={BTN_PRIMARY}>
                Continue
              </button>
            )}

            {step === "subject" && (
              <button
                type="button"
                disabled={!hasSubject}
                onClick={() => void goToStep("message")}
                className={BTN_PRIMARY}
              >
                Continue
              </button>
            )}

            {step === "message" && (
              <button
                type="button"
                disabled={!hasBody || loadingPreview}
                onClick={() => void goToStep("preview")}
                className={BTN_PRIMARY}
              >
                {loadingPreview ? "Loading preview…" : "Preview email"}
              </button>
            )}

            {step === "preview" && (
              <button
                type="button"
                disabled={!preview || sending || loadingPreview}
                onClick={() => void requestSend()}
                className={BTN_PRIMARY}
              >
                {sending ? "Sending…" : "Send email"}
              </button>
            )}
          </div>
        </div>
      )}

      {mode === "history" && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-dm text-sm text-cream/60">Past campaigns and delivery status.</p>
            <button type="button" onClick={startNewEmail} className={BTN_OUTLINE}>
              New email
            </button>
          </div>

          {historyLoading ? (
            <p className="font-dm text-sm text-cream/60">Loading history…</p>
          ) : campaigns.length === 0 ? (
            <div className="student-glass flex flex-col items-center gap-4 py-12 text-center">
              <p className="font-dm text-sm text-cream/60">No emails sent yet.</p>
              <button type="button" onClick={startNewEmail} className={BTN_PRIMARY}>
                Send your first email
              </button>
            </div>
          ) : (
            campaigns.map((campaign) => {
              const expanded = expandedCampaignId === campaign.id;
              const pending = campaign.deliveries.filter((d) => d.status === "pending").length;
              return (
                <div key={campaign.id} className="student-glass !p-0 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setExpandedCampaignId(expanded ? null : campaign.id)}
                    className="flex w-full flex-col gap-1 px-5 py-4 text-left hover:bg-white/[0.03]"
                  >
                    <p className="font-dm text-sm font-medium text-cream">{campaign.subject}</p>
                    <p className="font-dm text-xs text-cream/55">
                      {campaign.audienceLabel} · {campaign.sentCount} sent · {campaign.failedCount}{" "}
                      failed
                      {pending > 0 ? ` · ${pending} pending` : ""} ·{" "}
                      {new Date(campaign.createdAt).toLocaleString()}
                    </p>
                  </button>
                  {expanded && (
                    <ul className="space-y-2 border-t border-surface px-5 py-3">
                      {campaign.deliveries.map((delivery) => (
                        <li
                          key={delivery.id}
                          className="flex flex-wrap items-center justify-between gap-2 font-dm text-xs text-cream/75"
                        >
                          <span>
                            {delivery.recipientName || delivery.recipientEmail} ·{" "}
                            {delivery.recipientEmail}
                          </span>
                          <span
                            className={`rounded-sm px-2 py-0.5 font-mono text-[10px] uppercase ${
                              delivery.status === "sent"
                                ? "bg-sky-500/15 text-sky-200"
                                : delivery.status === "failed"
                                  ? "bg-red-500/15 text-red-300"
                                  : "bg-amber-500/15 text-amber-200"
                            }`}
                          >
                            {delivery.status}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Send audience email?"
        description={`Send "${subject.trim()}" to ${pendingRecipientCount} recipient${
          pendingRecipientCount === 1 ? "" : "s"
        }? Emails go out in batches of 10 per minute.`}
        confirmLabel="Send"
        onConfirm={() => void executeSend()}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
