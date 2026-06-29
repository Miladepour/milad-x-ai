"use client";

import { X } from "lucide-react";
import StudentPortalButton from "@/components/members/StudentPortalButton";
import { normalizeAnnouncementLink } from "@/lib/members/announcement-utils";
import type { StudentAnnouncementWithState } from "@/lib/members/types";

export interface StudentAnnouncementCardLabels {
  learnMore: string;
  read: string;
  unread: string;
}

interface StudentAnnouncementCardProps {
  item: StudentAnnouncementWithState;
  dateLocale: string;
  labels: StudentAnnouncementCardLabels;
  onDismiss?: (id: string) => void;
  onMarkRead?: (id: string) => void;
  showReadStatus?: boolean;
}

export default function StudentAnnouncementCard({
  item,
  dateLocale,
  labels,
  onDismiss,
  onMarkRead,
  showReadStatus = false,
}: StudentAnnouncementCardProps) {
  const linkUrl = normalizeAnnouncementLink(item.linkUrl);
  const linkLabel = item.linkLabel?.trim() || labels.learnMore;
  const isExternal = Boolean(linkUrl && /^https?:\/\//i.test(linkUrl));

  return (
    <article
      className={`relative flex gap-3 rounded-xl border px-4 py-4 transition-colors sm:items-start sm:gap-4 ${
        item.isRead
          ? "border-white/[0.08] bg-white/[0.03]"
          : "border-orange/25 bg-orange/[0.06]"
      }`}
      onClick={() => {
        if (!item.isRead) onMarkRead?.(item.id);
      }}
      role={onMarkRead ? "button" : undefined}
      tabIndex={onMarkRead ? 0 : undefined}
      onKeyDown={(event) => {
        if (!onMarkRead) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onMarkRead(item.id);
        }
      }}
    >
      {!item.isRead && (
        <span
          className="absolute start-3 top-4 h-2 w-2 rounded-full bg-orange"
          aria-hidden
        />
      )}

      <div className={`min-w-0 flex-1 ${!item.isRead ? "ps-4" : ""}`}>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="font-dm text-base font-semibold leading-snug text-cream sm:text-lg">
            {item.title}
          </h3>
          {showReadStatus && (
            <span
              className={`shrink-0 rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest ${
                item.isRead
                  ? "bg-white/[0.06] text-cream/45"
                  : "bg-orange/15 text-orange"
              }`}
            >
              {item.isRead ? labels.read : labels.unread}
            </span>
          )}
        </div>

        {item.body && (
          <p className="mt-2 font-dm text-sm leading-relaxed text-cream/65">{item.body}</p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-3">
          {linkUrl && (
            <span onClick={(event) => event.stopPropagation()} role="presentation">
              <StudentPortalButton
                href={linkUrl}
                variant="secondary"
                external={isExternal}
                className="!px-4 !py-2"
              >
                {linkLabel}
              </StudentPortalButton>
            </span>
          )}
          {item.publishedAt && (
            <time
              dateTime={item.publishedAt}
              className="font-mono text-[10px] uppercase tracking-wider text-cream/40"
              suppressHydrationWarning
            >
              {new Date(item.publishedAt).toLocaleDateString(dateLocale, {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </time>
          )}
        </div>
      </div>

      {onDismiss && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onDismiss(item.id);
          }}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-cream/45 transition-colors hover:bg-white/[0.06] hover:text-cream"
          aria-label="Dismiss announcement"
        >
          <X className="h-4 w-4" strokeWidth={1.75} />
        </button>
      )}
    </article>
  );
}
