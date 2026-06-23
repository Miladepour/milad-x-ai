"use client";

import dynamic from "next/dynamic";
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Download, Plus, Upload } from "lucide-react";
import {
  leadCsvTemplate,
  parseCsvRows,
  subscriberCsvTemplate,
} from "@/lib/audience/csv";
import type {
  AudienceCounts,
  AudienceListResult,
  Lead,
  NewsletterSubscriber,
  StudentAudienceFilter,
  WaitlistAudienceItem,
} from "@/lib/audience/types";

interface AudienceManagerProps {
  audienceRequest: (action: string, payload?: Record<string, unknown>) => Promise<unknown>;
  onStatus: (message: string, tone?: "success" | "error") => void;
}

type AudienceSubTab = "subscribers" | "leads" | "waitlist" | "email";

const SUB_TABS: { id: AudienceSubTab; label: string }[] = [
  { id: "subscribers", label: "Subscribers" },
  { id: "leads", label: "Leads" },
  { id: "waitlist", label: "Waitlist" },
  { id: "email", label: "Send email" },
];

const AudienceEmailComposer = dynamic(
  () => import("@/components/admin/AudienceEmailComposer"),
  {
    loading: () => (
      <p className="font-dm text-sm text-cream/70">Loading email composer…</p>
    ),
  }
);

function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function formatDate(value: string): string {
  return new Date(value).toLocaleString();
}

export default function AudienceManager({ audienceRequest, onStatus }: AudienceManagerProps) {
  const [subTab, setSubTab] = useState<AudienceSubTab>("subscribers");
  const [counts, setCounts] = useState<AudienceCounts | null>(null);
  const [subscriberSources, setSubscriberSources] = useState<string[]>([]);
  const [leadSources, setLeadSources] = useState<string[]>([]);
  const [waitlistCourses, setWaitlistCourses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "unsubscribed">("all");
  const [studentFilter, setStudentFilter] = useState<StudentAudienceFilter>("all");
  const [courseFilter, setCourseFilter] = useState("");
  const [page, setPage] = useState(1);

  const [subscriberData, setSubscriberData] = useState<AudienceListResult<NewsletterSubscriber> | null>(
    null
  );
  const [leadData, setLeadData] = useState<AudienceListResult<Lead> | null>(null);
  const [waitlistData, setWaitlistData] = useState<AudienceListResult<WaitlistAudienceItem> | null>(
    null
  );

  const [showAddForm, setShowAddForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedWaitlistId, setSelectedWaitlistId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [subscriberForm, setSubscriberForm] = useState({
    email: "",
    fullName: "",
    locale: "EN" as "EN" | "FA",
    source: "manual",
    sourceDetail: "",
    notes: "",
  });

  const [leadForm, setLeadForm] = useState({
    email: "",
    fullName: "",
    phone: "",
    country: "",
    locale: "EN" as "EN" | "FA",
    source: "manual",
    sourceDetail: "",
    notes: "",
  });

  const loadCounts = useCallback(async () => {
    const data = (await audienceRequest("counts")) as {
      counts: AudienceCounts;
      subscriberSources: string[];
      leadSources: string[];
      waitlistCourses: string[];
    };
    setCounts(data.counts);
    setSubscriberSources(data.subscriberSources ?? []);
    setLeadSources(data.leadSources ?? []);
    setWaitlistCourses(data.waitlistCourses ?? []);
  }, [audienceRequest]);

  const loadList = useCallback(async () => {
    setLoading(true);
    try {
      if (subTab === "subscribers") {
        const data = (await audienceRequest("list-subscribers", {
          page,
          search: debouncedSearch,
          source: sourceFilter,
          status: statusFilter,
          studentFilter,
        })) as AudienceListResult<NewsletterSubscriber>;
        setSubscriberData(data);
      } else if (subTab === "leads") {
        const data = (await audienceRequest("list-leads", {
          page,
          search: debouncedSearch,
          source: sourceFilter,
          studentFilter,
        })) as AudienceListResult<Lead>;
        setLeadData(data);
      } else {
        const data = (await audienceRequest("list-waitlist", {
          page,
          search: debouncedSearch,
          courseSlug: courseFilter,
          studentFilter,
        })) as AudienceListResult<WaitlistAudienceItem>;
        setWaitlistData(data);
      }
    } catch (err) {
      onStatus(err instanceof Error ? err.message : "Could not load audience", "error");
    } finally {
      setLoading(false);
    }
  }, [
    audienceRequest,
    courseFilter,
    debouncedSearch,
    onStatus,
    page,
    sourceFilter,
    statusFilter,
    studentFilter,
    subTab,
  ]);

  useEffect(() => {
    void loadCounts().catch((err) =>
      onStatus(err instanceof Error ? err.message : "Could not load counts", "error")
    );
  }, [loadCounts, onStatus]);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [subTab, debouncedSearch, sourceFilter, statusFilter, courseFilter, studentFilter]);

  useEffect(() => {
    if (subTab === "email") return;
    void loadList();
  }, [loadList, subTab]);

  const activeList = useMemo(() => {
    if (subTab === "subscribers") return subscriberData;
    if (subTab === "leads") return leadData;
    return waitlistData;
  }, [leadData, subTab, subscriberData, waitlistData]);

  const tabCount = useMemo(() => {
    if (!counts) return 0;
    if (subTab === "subscribers") return counts.subscribers;
    if (subTab === "leads") return counts.leads;
    return counts.waitlist;
  }, [counts, subTab]);

  async function refreshAll() {
    await loadCounts();
    await loadList();
  }

  async function handleAddSubscriber(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    try {
      await audienceRequest("add-subscriber", subscriberForm);
      onStatus("Subscriber saved.", "success");
      setSubscriberForm({
        email: "",
        fullName: "",
        locale: "EN",
        source: "manual",
        sourceDetail: "",
        notes: "",
      });
      setShowAddForm(false);
      await refreshAll();
    } catch (err) {
      onStatus(err instanceof Error ? err.message : "Could not save subscriber", "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAddLead(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    try {
      await audienceRequest("add-lead", leadForm);
      onStatus("Lead saved.", "success");
      setLeadForm({
        email: "",
        fullName: "",
        phone: "",
        country: "",
        locale: "EN",
        source: "manual",
        sourceDetail: "",
        notes: "",
      });
      setShowAddForm(false);
      await refreshAll();
    } catch (err) {
      onStatus(err instanceof Error ? err.message : "Could not save lead", "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCsvUpload(file: File) {
    const text = await file.text();
    const rows = parseCsvRows(text);
    if (rows.length < 2) {
      onStatus("CSV must include a header row and at least one contact.", "error");
      return;
    }

    setSubmitting(true);
    try {
      const action = subTab === "subscribers" ? "import-subscribers" : "import-leads";
      const result = (await audienceRequest(action, { csvText: text })) as {
        inserted: number;
        updated: number;
        skipped: number;
        errors: string[];
      };
      const summary = `Import done: ${result.inserted} new, ${result.updated} updated, ${result.skipped} skipped.`;
      if (result.errors.length > 0) {
        onStatus(`${summary} ${result.errors.slice(0, 3).join(" ")}`, "error");
      } else {
        onStatus(summary, "success");
      }
      setShowImport(false);
      await refreshAll();
    } catch (err) {
      onStatus(err instanceof Error ? err.message : "Import failed", "error");
    } finally {
      setSubmitting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function markWaitlistOpened(id: string) {
    try {
      await audienceRequest("mark-waitlist-opened", { id });
      await refreshAll();
    } catch (err) {
      onStatus(err instanceof Error ? err.message : "Could not update waitlist item", "error");
    }
  }

  const sourceOptions =
    subTab === "subscribers"
      ? subscriberSources
      : subTab === "leads"
        ? leadSources
        : waitlistCourses;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="student-section-title">Audience</h1>
          <p className="mt-1 font-dm text-sm text-cream/60">
            Newsletter subscribers, leads, course waitlists, and audience email.
          </p>
        </div>
        {counts && (
          <div className="flex flex-wrap gap-2">
            <CountPill label="Subscribers" value={counts.subscribersActive} hint="active" />
            <CountPill label="Leads" value={counts.leads} />
            <CountPill label="Waitlist" value={counts.waitlist} />
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 border-b border-surface pb-3">
        {SUB_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setSubTab(tab.id);
              setShowAddForm(false);
              setShowImport(false);
              setSelectedWaitlistId(null);
              setSourceFilter("");
              setStatusFilter("all");
              setStudentFilter("all");
              setCourseFilter("");
              setSearch("");
            }}
            className={`rounded-sm px-3 py-1.5 font-dm text-sm transition-colors ${
              subTab === tab.id
                ? "bg-orange/15 text-orange"
                : "text-cream/70 hover:text-cream"
            }`}
          >
            {tab.label}
            {counts && tab.id !== "email" && (
              <span className="ms-2 font-mono text-[10px] text-cream/45">
                {tab.id === "subscribers"
                  ? counts.subscribers
                  : tab.id === "leads"
                    ? counts.leads
                    : counts.waitlist}
              </span>
            )}
          </button>
        ))}
      </div>

      {subTab === "email" ? (
        <AudienceEmailComposer
          audienceRequest={audienceRequest}
          onStatus={onStatus}
          subscriberSources={subscriberSources}
          leadSources={leadSources}
          waitlistCourses={waitlistCourses}
        />
      ) : (
        <>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap">
          <label className="min-w-[220px] flex-1">
            <span className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-cream/45">
              Search
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-field"
              placeholder="Name, email, phone, source…"
            />
          </label>

          {subTab === "waitlist" ? (
            <label className="min-w-[180px]">
              <span className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-cream/45">
                Course
              </span>
              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="form-field"
              >
                <option value="">All courses</option>
                {sourceOptions.map((course) => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <label className="min-w-[180px]">
              <span className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-cream/45">
                Source
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

          {subTab === "subscribers" && (
            <label className="min-w-[160px]">
              <span className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-cream/45">
                Status
              </span>
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as "all" | "active" | "unsubscribed")
                }
                className="form-field"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="unsubscribed">Unsubscribed</option>
              </select>
            </label>
          )}

          <label className="min-w-[160px]">
            <span className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-cream/45">
              Student
            </span>
            <select
              value={studentFilter}
              onChange={(e) =>
                setStudentFilter(e.target.value as StudentAudienceFilter)
              }
              className="form-field"
            >
              <option value="all">All contacts</option>
              <option value="non-students">Non-students only</option>
              <option value="students">Students only</option>
            </select>
          </label>
        </div>

        {subTab !== "waitlist" && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setShowAddForm((open) => !open);
                setShowImport(false);
              }}
              className="student-btn-secondary inline-flex items-center gap-2"
            >
              <Plus size={16} aria-hidden />
              Add manually
            </button>
            <button
              type="button"
              onClick={() =>
                downloadTextFile(
                  subTab === "subscribers" ? "subscriber-template.csv" : "lead-template.csv",
                  subTab === "subscribers" ? subscriberCsvTemplate() : leadCsvTemplate()
                )
              }
              className="student-btn-secondary inline-flex items-center gap-2"
            >
              <Download size={16} aria-hidden />
              CSV template
            </button>
            <button
              type="button"
              onClick={() => {
                setShowImport((open) => !open);
                setShowAddForm(false);
              }}
              className="student-btn-secondary inline-flex items-center gap-2"
            >
              <Upload size={16} aria-hidden />
              Import CSV
            </button>
          </div>
        )}
      </div>

      {showAddForm && subTab === "subscribers" && (
        <form onSubmit={handleAddSubscriber} className="student-glass grid gap-3 md:grid-cols-2">
          <input
            type="email"
            required
            value={subscriberForm.email}
            onChange={(e) => setSubscriberForm((f) => ({ ...f, email: e.target.value }))}
            className="form-field"
            placeholder="Email"
          />
          <input
            value={subscriberForm.fullName}
            onChange={(e) => setSubscriberForm((f) => ({ ...f, fullName: e.target.value }))}
            className="form-field"
            placeholder="Full name"
          />
          <input
            value={subscriberForm.source}
            onChange={(e) => setSubscriberForm((f) => ({ ...f, source: e.target.value }))}
            className="form-field"
            placeholder="Source (e.g. webinar, website)"
          />
          <input
            value={subscriberForm.sourceDetail}
            onChange={(e) => setSubscriberForm((f) => ({ ...f, sourceDetail: e.target.value }))}
            className="form-field"
            placeholder="Source detail"
          />
          <select
            value={subscriberForm.locale}
            onChange={(e) =>
              setSubscriberForm((f) => ({
                ...f,
                locale: e.target.value === "FA" ? "FA" : "EN",
              }))
            }
            className="form-field"
          >
            <option value="EN">English</option>
            <option value="FA">Farsi</option>
          </select>
          <input
            value={subscriberForm.notes}
            onChange={(e) => setSubscriberForm((f) => ({ ...f, notes: e.target.value }))}
            className="form-field md:col-span-2"
            placeholder="Notes"
          />
          <div className="md:col-span-2">
            <button type="submit" disabled={submitting} className="student-btn-primary">
              {submitting ? "Saving…" : "Save subscriber"}
            </button>
          </div>
        </form>
      )}

      {showAddForm && subTab === "leads" && (
        <form onSubmit={handleAddLead} className="student-glass grid gap-3 md:grid-cols-2">
          <input
            type="email"
            required
            value={leadForm.email}
            onChange={(e) => setLeadForm((f) => ({ ...f, email: e.target.value }))}
            className="form-field"
            placeholder="Email"
          />
          <input
            value={leadForm.fullName}
            onChange={(e) => setLeadForm((f) => ({ ...f, fullName: e.target.value }))}
            className="form-field"
            placeholder="Full name"
          />
          <input
            value={leadForm.phone}
            onChange={(e) => setLeadForm((f) => ({ ...f, phone: e.target.value }))}
            className="form-field"
            placeholder="Phone"
          />
          <input
            value={leadForm.country}
            onChange={(e) => setLeadForm((f) => ({ ...f, country: e.target.value }))}
            className="form-field"
            placeholder="Country"
          />
          <input
            value={leadForm.source}
            onChange={(e) => setLeadForm((f) => ({ ...f, source: e.target.value }))}
            className="form-field"
            placeholder="Source (e.g. webinar)"
          />
          <input
            value={leadForm.sourceDetail}
            onChange={(e) => setLeadForm((f) => ({ ...f, sourceDetail: e.target.value }))}
            className="form-field"
            placeholder="Source detail"
          />
          <select
            value={leadForm.locale}
            onChange={(e) =>
              setLeadForm((f) => ({
                ...f,
                locale: e.target.value === "FA" ? "FA" : "EN",
              }))
            }
            className="form-field"
          >
            <option value="EN">English</option>
            <option value="FA">Farsi</option>
          </select>
          <input
            value={leadForm.notes}
            onChange={(e) => setLeadForm((f) => ({ ...f, notes: e.target.value }))}
            className="form-field"
            placeholder="Notes"
          />
          <div className="md:col-span-2">
            <button type="submit" disabled={submitting} className="student-btn-primary">
              {submitting ? "Saving…" : "Save lead"}
            </button>
          </div>
        </form>
      )}

      {showImport && subTab !== "waitlist" && (
        <div className="student-glass space-y-3">
          <p className="font-dm text-sm text-cream/70">
            Upload a CSV using the template columns. Existing emails will be updated.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            disabled={submitting}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleCsvUpload(file);
            }}
            className="block w-full font-dm text-sm text-cream/80 file:me-3 file:rounded-sm file:border-0 file:bg-orange/15 file:px-3 file:py-2 file:font-dm file:text-sm file:text-orange"
          />
        </div>
      )}

      <div className="student-glass overflow-hidden">
        <div className="flex items-center justify-between border-b border-surface px-4 py-3">
          <p className="font-dm text-sm text-cream/70">
            {loading ? "Loading…" : `${activeList?.total ?? 0} total · showing page ${page}`}
          </p>
          <p className="font-mono text-[10px] uppercase tracking-widest text-cream/45">
            20 per page
          </p>
        </div>

        {loading ? (
          <p className="px-4 py-8 font-dm text-sm text-cream/60">Loading audience…</p>
        ) : subTab === "subscribers" ? (
          <SubscriberTable items={subscriberData?.items ?? []} />
        ) : subTab === "leads" ? (
          <LeadTable items={leadData?.items ?? []} />
        ) : (
          <WaitlistTable
            items={waitlistData?.items ?? []}
            selectedId={selectedWaitlistId}
            onSelect={(id) => {
              setSelectedWaitlistId(id);
              void markWaitlistOpened(id);
            }}
          />
        )}

        <Pagination
          page={page}
          totalPages={activeList?.totalPages ?? 1}
          onPageChange={setPage}
          disabled={loading}
        />
      </div>

      {!loading && (activeList?.total ?? 0) === 0 && (
        <p className="font-dm text-sm text-cream/55">
          No {subTab} yet
          {subTab !== "waitlist" ? ". Add manually or import a CSV to get started." : "."}
        </p>
      )}

      {tabCount > 0 && subTab !== "waitlist" && (
        <p className="font-dm text-xs text-cream/45">
          Tip: use source values like <span className="text-cream/70">webinar</span> or{" "}
          <span className="text-cream/70">website</span> so you can filter before sending email later.
          Use <span className="text-cream/70">Non-students only</span> when targeting marketing sends.
        </p>
      )}
        </>
      )}
    </div>
  );
}

function StudentBadge() {
  return (
    <span className="ms-2 shrink-0 rounded-sm bg-sky-500/15 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide text-sky-300">
      Student
    </span>
  );
}

function EmailCell({ email, isStudent }: { email: string; isStudent: boolean }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-x-1">
      <span>{email}</span>
      {isStudent && <StudentBadge />}
    </span>
  );
}

function CountPill({
  label,
  value,
  hint,
}: {
  label: string;
  value: number;
  hint?: string;
}) {
  return (
    <div className="rounded-sm border border-surface px-3 py-2">
      <p className="font-mono text-[10px] uppercase tracking-widest text-cream/45">{label}</p>
      <p className="font-dm text-lg font-semibold text-cream">
        {value}
        {hint && <span className="ms-1 text-xs font-normal text-cream/45">({hint})</span>}
      </p>
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  onPageChange,
  disabled,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-t border-surface px-4 py-3">
      <button
        type="button"
        disabled={disabled || page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="student-btn-secondary inline-flex items-center gap-1 disabled:opacity-40"
      >
        <ChevronLeft size={16} aria-hidden />
        Previous
      </button>
      <p className="font-dm text-sm text-cream/65">
        Page {page} of {totalPages}
      </p>
      <button
        type="button"
        disabled={disabled || page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="student-btn-secondary inline-flex items-center gap-1 disabled:opacity-40"
      >
        Next
        <ChevronRight size={16} aria-hidden />
      </button>
    </div>
  );
}

function SubscriberTable({ items }: { items: NewsletterSubscriber[] }) {
  if (items.length === 0) return null;
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left">
        <thead className="border-b border-surface bg-surface/30">
          <tr className="font-mono text-[10px] uppercase tracking-widest text-cream/45">
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Source</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Added</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-surface/70 font-dm text-sm text-cream/85">
              <td className="px-4 py-3">{item.fullName || "—"}</td>
              <td className="px-4 py-3">
                <EmailCell email={item.email} isStudent={item.isStudent} />
              </td>
              <td className="px-4 py-3">
                <span>{item.source}</span>
                {item.sourceDetail && (
                  <span className="mt-0.5 block text-xs text-cream/45">{item.sourceDetail}</span>
                )}
              </td>
              <td className="px-4 py-3 capitalize">{item.status}</td>
              <td className="px-4 py-3 text-cream/60">{formatDate(item.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LeadTable({ items }: { items: Lead[] }) {
  if (items.length === 0) return null;
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left">
        <thead className="border-b border-surface bg-surface/30">
          <tr className="font-mono text-[10px] uppercase tracking-widest text-cream/45">
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Phone</th>
            <th className="px-4 py-3">Country</th>
            <th className="px-4 py-3">Source</th>
            <th className="px-4 py-3">Added</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-surface/70 font-dm text-sm text-cream/85">
              <td className="px-4 py-3">{item.fullName || "—"}</td>
              <td className="px-4 py-3">
                <EmailCell email={item.email} isStudent={item.isStudent} />
              </td>
              <td className="px-4 py-3">{item.phone || "—"}</td>
              <td className="px-4 py-3">{item.country || "—"}</td>
              <td className="px-4 py-3">
                <span>{item.source}</span>
                {item.sourceDetail && (
                  <span className="mt-0.5 block text-xs text-cream/45">{item.sourceDetail}</span>
                )}
              </td>
              <td className="px-4 py-3 text-cream/60">{formatDate(item.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function WaitlistTable({
  items,
  selectedId,
  onSelect,
}: {
  items: WaitlistAudienceItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  if (items.length === 0) return null;
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left">
        <thead className="border-b border-surface bg-surface/30">
          <tr className="font-mono text-[10px] uppercase tracking-widest text-cream/45">
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Phone</th>
            <th className="px-4 py-3">Course</th>
            <th className="px-4 py-3">Submitted</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={item.id}
              className={`border-b border-surface/70 font-dm text-sm transition-colors ${
                selectedId === item.id ? "bg-orange/10" : "text-cream/85"
              } ${!item.openedAt ? "cursor-pointer hover:bg-surface/40" : ""}`}
              onClick={() => {
                if (!item.openedAt) onSelect(item.id);
              }}
            >
              <td className="px-4 py-3">
                {item.fullName}
                {!item.openedAt && (
                  <span className="ms-2 rounded-sm bg-orange/15 px-1.5 py-0.5 font-mono text-[10px] uppercase text-orange">
                    New
                  </span>
                )}
              </td>
              <td className="px-4 py-3">
                <EmailCell email={item.email} isStudent={item.isStudent} />
              </td>
              <td className="px-4 py-3">{item.mobile}</td>
              <td className="px-4 py-3">{item.courseSlug}</td>
              <td className="px-4 py-3 text-cream/60">{formatDate(item.submittedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
