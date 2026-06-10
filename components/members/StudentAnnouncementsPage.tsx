"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import StudentAnnouncementCard from "@/components/members/StudentAnnouncementCard";
import StudentGlassCard from "@/components/members/StudentGlassCard";
import type { StudentAnnouncementCardLabels } from "@/components/members/StudentAnnouncementCard";
import type { StudentAnnouncementWithState } from "@/lib/members/types";

type Filter = "all" | "unread" | "read";

interface StudentAnnouncementsPageProps {
  announcements: StudentAnnouncementWithState[];
  labels: StudentAnnouncementCardLabels & {
    pageTitle: string;
    pageSubtitle: string;
    noAnnouncements: string;
    markAllRead: string;
    filterAll: string;
    filterUnread: string;
    filterRead: string;
  };
  dateLocale: string;
}

export default function StudentAnnouncementsPage({
  announcements: initialAnnouncements,
  labels,
  dateLocale,
}: StudentAnnouncementsPageProps) {
  const router = useRouter();
  const [announcements, setAnnouncements] = useState(
    initialAnnouncements.filter((item) => !item.isDismissed)
  );
  const [filter, setFilter] = useState<Filter>("all");
  const [markingAll, setMarkingAll] = useState(false);

  const filtered = useMemo(() => {
    if (filter === "unread") return announcements.filter((item) => !item.isRead);
    if (filter === "read") return announcements.filter((item) => item.isRead);
    return announcements;
  }, [announcements, filter]);

  const unreadCount = announcements.filter((item) => !item.isRead).length;

  async function markRead(id: string) {
    setAnnouncements((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, isRead: true, readAt: new Date().toISOString() }
          : item
      )
    );
    try {
      await fetch("/api/members/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ action: "mark-read", announcementId: id }),
      });
      router.refresh();
    } catch {
      router.refresh();
    }
  }

  async function dismissAnnouncement(id: string) {
    setAnnouncements((current) => current.filter((item) => item.id !== id));
    try {
      await fetch("/api/members/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ action: "dismiss", announcementId: id }),
      });
      router.refresh();
    } catch {
      router.refresh();
    }
  }

  async function markAllRead() {
    setMarkingAll(true);
    const now = new Date().toISOString();
    setAnnouncements((current) =>
      current.map((item) => ({ ...item, isRead: true, readAt: item.readAt ?? now }))
    );
    try {
      await fetch("/api/members/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ action: "mark-all-read" }),
      });
      router.refresh();
    } catch {
      router.refresh();
    } finally {
      setMarkingAll(false);
    }
  }

  const filterOptions: { id: Filter; label: string }[] = [
    { id: "all", label: labels.filterAll },
    { id: "unread", label: labels.filterUnread },
    { id: "read", label: labels.filterRead },
  ];

  return (
    <div className="flex flex-col gap-5 pb-10 sm:gap-6">
      <StudentGlassCard>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-dm text-2xl font-semibold text-cream sm:text-3xl">
              {labels.pageTitle}
            </h1>
            <p className="mt-2 font-dm text-sm text-cream/60">{labels.pageSubtitle}</p>
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => void markAllRead()}
              disabled={markingAll}
              className="rounded-full border border-orange/50 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-orange transition-colors hover:bg-orange hover:text-background disabled:opacity-50"
            >
              {markingAll ? "…" : labels.markAllRead}
            </button>
          )}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {filterOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setFilter(option.id)}
              className={`rounded-full px-4 py-2 font-mono text-[10px] uppercase tracking-widest transition-colors ${
                filter === option.id
                  ? "bg-orange text-background"
                  : "border border-white/[0.1] text-cream/70 hover:border-orange hover:text-orange"
              }`}
            >
              {option.label}
              {option.id === "unread" && unreadCount > 0 ? ` (${unreadCount})` : ""}
            </button>
          ))}
        </div>
      </StudentGlassCard>

      <StudentGlassCard>
        {filtered.length === 0 ? (
          <p className="font-dm text-sm text-cream/55">{labels.noAnnouncements}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {filtered.map((item) => (
              <li key={item.id}>
                <StudentAnnouncementCard
                  item={item}
                  dateLocale={dateLocale}
                  labels={labels}
                  showReadStatus
                  onDismiss={dismissAnnouncement}
                  onMarkRead={markRead}
                />
              </li>
            ))}
          </ul>
        )}
      </StudentGlassCard>
    </div>
  );
}
