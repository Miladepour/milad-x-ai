"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { BlogPostListItem } from "@/lib/blog/types";
import type { ContactSubmission } from "@/lib/contact/types";
import type { WaitlistSubmission } from "@/lib/courses/types";
import AdminInsightsPanel from "@/components/admin/AdminInsights";
import AdminShell, { type AdminTab } from "@/components/admin/AdminShell";
import { useNotifications } from "@/components/notifications/NotificationProvider";
import type { AdminInsights } from "@/lib/admin/insights";
import type { AppNotification } from "@/lib/notifications/types";

const CourseEditor = dynamic(() => import("@/components/admin/CourseEditor"), {
  loading: () => (
    <p className="font-dm text-sm text-cream/70">Loading course editor…</p>
  ),
});

const ProgramEditor = dynamic(() => import("@/components/admin/ProgramEditor"), {
  loading: () => (
    <p className="font-dm text-sm text-cream/70">Loading programs…</p>
  ),
});

const StudentManager = dynamic(() => import("@/components/admin/StudentManager"), {
  loading: () => (
    <p className="font-dm text-sm text-cream/70">Loading students…</p>
  ),
});

const AudienceManager = dynamic(() => import("@/components/admin/AudienceManager"), {
  loading: () => (
    <p className="font-dm text-sm text-cream/70">Loading audience…</p>
  ),
});

const BlogEditorTab = dynamic(() => import("@/components/admin/BlogEditorTab"), {
  loading: () => (
    <p className="font-dm text-sm text-cream/70">Loading blog editor…</p>
  ),
});

interface AdminSummary {
  contactSubmissions: ContactSubmission[];
  waitlistSubmissions: WaitlistSubmission[];
}

interface SubmissionField {
  label: string;
  value: string;
  wide?: boolean;
}

interface SubmissionCard {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  isUnopened?: boolean;
  fields: SubmissionField[];
}

interface AdminDashboardProps {
  adminEmail: string;
  summary: AdminSummary;
  summaryLoaded: boolean;
  summaryLoading: boolean;
  blogPosts: BlogPostListItem[];
  blogLoaded: boolean;
  blogLoading: boolean;
  insights: AdminInsights | null;
  isBootstrapping: boolean;
  onSignOut: () => Promise<void>;
  onRefresh: () => Promise<void>;
  adminRequest: (action: string, payload?: Record<string, unknown>) => Promise<unknown>;
  membersRequest: (action: string, payload?: Record<string, unknown>) => Promise<unknown>;
  audienceRequest: (action: string, payload?: Record<string, unknown>) => Promise<unknown>;
  onEnsureSummaryLoaded: () => Promise<void>;
  onEnsureBlogLoaded: () => Promise<void>;
  onReloadBlogPosts: () => Promise<void>;
}

export default function AdminDashboard({
  adminEmail,
  summary,
  summaryLoaded,
  summaryLoading,
  blogPosts,
  blogLoaded,
  blogLoading,
  insights,
  isBootstrapping,
  onSignOut,
  onRefresh,
  adminRequest,
  membersRequest,
  audienceRequest,
  onEnsureSummaryLoaded,
  onEnsureBlogLoaded,
  onReloadBlogPosts,
}: AdminDashboardProps) {
  const [tab, setTab] = useState<AdminTab>("overview");
  const [visitedTabs, setVisitedTabs] = useState<Set<AdminTab>>(
    () => new Set<AdminTab>(["overview"])
  );
  const { notify } = useNotifications();

  useEffect(() => {
    setVisitedTabs((current) => {
      if (current.has(tab)) return current;
      const next = new Set(current);
      next.add(tab);
      return next;
    });
  }, [tab]);

  useEffect(() => {
    if (tab === "contact") {
      void onEnsureSummaryLoaded();
    }
    if (tab === "blog") {
      void onEnsureBlogLoaded();
    }
  }, [tab, onEnsureBlogLoaded, onEnsureSummaryLoaded]);

  const contactItems = useMemo(
    () =>
      summary.contactSubmissions.map((item) => ({
        id: item.id,
        title: item.fullName,
        subtitle: `${item.inquiryType} · ${item.country}`,
        date: item.submittedAt,
        isUnopened: !item.openedAt,
        fields: [
          { label: "Full name", value: item.fullName },
          { label: "Email", value: item.email },
          { label: "Mobile", value: item.mobile },
          { label: "Country", value: item.country },
          { label: "Inquiry type", value: item.inquiryType },
          { label: "Language", value: item.locale },
          { label: "Submitted at", value: new Date(item.submittedAt).toLocaleString() },
          { label: "Message", value: item.message, wide: true },
        ],
      })),
    [summary.contactSubmissions]
  );

  function handleNotificationClick(notification: AppNotification) {
    if (notification.kind === "contact") {
      setTab("contact");
      return;
    }
    if (notification.kind === "waitlist") {
      setTab("audience");
    }
  }

  return (
    <AdminShell
      adminEmail={adminEmail}
      tab={tab}
      onTabChange={setTab}
      onRefresh={() => void onRefresh()}
      onSignOut={() => void onSignOut()}
      isRefreshing={isBootstrapping}
      onNotificationClick={handleNotificationClick}
      navBadges={{
        contact: insights?.counts.unopenedContact ?? 0,
        audience: insights?.counts.unopenedWaitlist ?? 0,
        students: insights?.counts.students,
        blog: insights?.counts.blogPosts ?? blogPosts.length,
      }}
    >
      {isBootstrapping && tab === "overview" && (
        <p className="student-glass font-dm text-sm text-cream/70">Loading insights…</p>
      )}

      {visitedTabs.has("overview") && (
        <div className={tab === "overview" ? "block" : "hidden"}>
          {insights ? (
            <AdminInsightsPanel insights={insights} onNavigate={setTab} />
          ) : !isBootstrapping ? (
            <p className="student-glass font-dm text-sm text-cream/70">No insights available.</p>
          ) : null}
        </div>
      )}

      {visitedTabs.has("courses") && (
        <div className={tab === "courses" ? "block" : "hidden"}>
          <div className="student-glass">
            <CourseEditor adminRequest={adminRequest} onStatus={notify} />
          </div>
        </div>
      )}

      {visitedTabs.has("programs") && (
        <div className={tab === "programs" ? "block" : "hidden"}>
          <div className="student-glass">
            <ProgramEditor membersRequest={membersRequest} onStatus={notify} />
          </div>
        </div>
      )}

      {visitedTabs.has("students") && (
        <div className={tab === "students" ? "block" : "hidden"}>
          <div className="student-glass">
            <StudentManager membersRequest={membersRequest} onStatus={notify} />
          </div>
        </div>
      )}

      {visitedTabs.has("blog") && (
        <div className={tab === "blog" ? "block" : "hidden"}>
          {blogLoading && !blogLoaded ? (
            <p className="student-glass font-dm text-sm text-cream/70">Loading blog posts…</p>
          ) : (
            <BlogEditorTab
              blogPosts={blogPosts}
              adminRequest={adminRequest}
              loadBlogPosts={onReloadBlogPosts}
              onStatus={notify}
            />
          )}
        </div>
      )}

      {visitedTabs.has("contact") && (
        <div className={tab === "contact" ? "block" : "hidden"}>
          {summaryLoading && !summaryLoaded ? (
            <p className="student-glass font-dm text-sm text-cream/70">Loading contact inbox…</p>
          ) : (
            <SubmissionList
              empty="No contact forms yet."
              onOpenItem={async (id) => {
                await adminRequest("mark-contact-opened", { id });
                await onRefresh();
              }}
              items={contactItems}
            />
          )}
        </div>
      )}

      {visitedTabs.has("audience") && (
        <div className={tab === "audience" ? "block" : "hidden"}>
          <div className="student-glass">
            <AudienceManager audienceRequest={audienceRequest} onStatus={notify} />
          </div>
        </div>
      )}
    </AdminShell>
  );
}

function SubmissionList({
  empty,
  items,
  onOpenItem,
}: {
  empty: string;
  items: SubmissionCard[];
  onOpenItem?: (id: string) => Promise<void>;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const fromTime = dateFrom ? new Date(`${dateFrom}T00:00:00`).getTime() : null;
    const toTime = dateTo ? new Date(`${dateTo}T23:59:59`).getTime() : null;

    return items.filter((item) => {
      const submittedTime = new Date(item.date).getTime();
      const matchesDate =
        (!fromTime || submittedTime >= fromTime) &&
        (!toTime || submittedTime <= toTime);

      if (!matchesDate) return false;
      if (!normalizedQuery) return true;

      const searchable = [
        item.title,
        item.subtitle,
        item.date,
        ...item.fields.flatMap((field) => [field.label, field.value]),
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(normalizedQuery);
    });
  }, [dateFrom, dateTo, items, query]);

  async function copyField(key: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(key);
      window.setTimeout(() => setCopiedField(null), 1200);
    } catch {
      setCopiedField(null);
    }
  }

  if (items.length === 0) {
    return (
      <div className="student-glass p-8 font-dm text-cream/70">
        {empty}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="student-glass grid gap-3 md:grid-cols-[1fr_190px_190px_auto]">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="form-field"
          placeholder="Search name, email, phone, country, message..."
        />
        <input
          type="date"
          value={dateFrom}
          onChange={(event) => setDateFrom(event.target.value)}
          className="form-field"
          aria-label="Filter from date"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(event) => setDateTo(event.target.value)}
          className="form-field"
          aria-label="Filter to date"
        />
        <button
          type="button"
          onClick={() => {
            setQuery("");
            setDateFrom("");
            setDateTo("");
          }}
          className="border border-surface px-4 py-3 font-mono text-xs uppercase tracking-widest text-cream transition-colors hover:border-orange hover:text-orange"
        >
          Clear
        </button>
      </div>

      <p className="font-mono text-xs uppercase tracking-widest text-cream/60">
        Showing {filteredItems.length} of {items.length}
      </p>

      {filteredItems.length === 0 ? (
        <div className="student-glass p-8 font-dm text-cream/70">
          No submissions match your filters.
        </div>
      ) : (
        <ul className="grid gap-4">
          {filteredItems.map((item) => {
            const isOpen = openId === item.id;

            return (
              <li key={item.id} className="student-glass-strong student-glass !p-0">
                <button
                  type="button"
                  onClick={() => {
                    const nextOpen = isOpen ? null : item.id;
                    setOpenId(nextOpen);
                    if (!isOpen && nextOpen && item.isUnopened && onOpenItem) {
                      void onOpenItem(item.id);
                    }
                  }}
                  className="flex w-full flex-col gap-3 p-5 text-left transition-colors hover:bg-surface/35 md:flex-row md:items-start md:justify-between"
                  aria-expanded={isOpen}
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-dm text-xl font-semibold text-cream">
                        {item.title}
                      </h2>
                      {item.isUnopened && (
                        <span className="rounded-full bg-orange/20 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-orange">
                          New
                        </span>
                      )}
                    </div>
                    <p className="mt-1 font-dm text-sm text-cream/70">
                      {item.subtitle}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <time className="font-mono text-xs text-orange">
                      {new Date(item.date).toLocaleString()}
                    </time>
                    <span className="font-mono text-xl text-orange">
                      {isOpen ? "-" : "+"}
                    </span>
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-surface p-5">
                    <div className="grid gap-3 md:grid-cols-2">
                      {item.fields.map((field) => {
                        const key = `${item.id}-${field.label}`;

                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => copyField(key, field.value)}
                            className={`group border border-surface bg-background/40 p-4 text-left transition-colors hover:border-orange ${
                              field.wide ? "md:col-span-2" : ""
                            }`}
                          >
                            <span className="flex items-center justify-between gap-3 border-b border-surface pb-2">
                              <span className="font-mono text-[10px] uppercase tracking-widest text-orange">
                                {field.label}
                              </span>
                              <span className="font-mono text-[10px] uppercase tracking-widest text-cream/45 group-hover:text-orange">
                                {copiedField === key ? "Copied" : "Copy"}
                              </span>
                            </span>
                            <span className="mt-3 block whitespace-pre-wrap break-words font-dm text-sm leading-relaxed text-cream">
                              {field.value}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
