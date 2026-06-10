"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import StudentAnnouncementCard from "@/components/members/StudentAnnouncementCard";
import StudentGlassCard from "@/components/members/StudentGlassCard";
import type { StudentAnnouncementCardLabels } from "@/components/members/StudentAnnouncementCard";
import type { StudentAnnouncementWithState } from "@/lib/members/types";

interface StudentAnnouncementsDashboardProps {
  announcements: StudentAnnouncementWithState[];
  announcementsHref: string;
  labels: StudentAnnouncementCardLabels & {
    sectionTitle: string;
    noAnnouncements: string;
    seeAll: string;
  };
  dateLocale: string;
}

const DASHBOARD_LIMIT = 3;

export default function StudentAnnouncementsDashboard({
  announcements: initialAnnouncements,
  announcementsHref,
  labels,
  dateLocale,
}: StudentAnnouncementsDashboardProps) {
  const router = useRouter();
  const [announcements, setAnnouncements] = useState(
    initialAnnouncements.filter((item) => !item.isDismissed)
  );

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

  const visible = announcements.slice(0, DASHBOARD_LIMIT);
  const hasMore = announcements.length > DASHBOARD_LIMIT;

  return (
    <StudentGlassCard id="announcements" className="scroll-mt-36">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="student-section-title">{labels.sectionTitle}</h2>
        {announcements.length > 0 && (
          <Link
            href={announcementsHref}
            className="font-mono text-[10px] uppercase tracking-widest text-orange transition-colors hover:text-cream"
          >
            {labels.seeAll}
          </Link>
        )}
      </div>

      {visible.length === 0 ? (
        <p className="mt-4 font-dm text-sm text-cream/55">{labels.noAnnouncements}</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-2">
          {visible.map((item) => (
            <li key={item.id}>
              <StudentAnnouncementCard
                item={item}
                dateLocale={dateLocale}
                labels={labels}
                onDismiss={dismissAnnouncement}
              />
            </li>
          ))}
        </ul>
      )}

      {hasMore && (
        <div className="mt-4">
          <Link
            href={announcementsHref}
            className="inline-flex rounded-full border border-orange/50 px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-orange transition-colors hover:bg-orange hover:text-background"
          >
            {labels.seeAll}
          </Link>
        </div>
      )}
    </StudentGlassCard>
  );
}
