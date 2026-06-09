"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Bell,
  CheckCheck,
  Mail,
  Megaphone,
  MessageSquare,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useNotifications } from "@/components/notifications/NotificationProvider";
import type { AppNotification, NotificationKind } from "@/lib/notifications/types";

const kindIcons: Record<NotificationKind, LucideIcon> = {
  contact: MessageSquare,
  waitlist: Users,
  announcement: Megaphone,
  system: Mail,
};

function formatWhen(iso: string) {
  const date = new Date(iso);
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

interface NotificationBellProps {
  onNotificationClick?: (notification: AppNotification) => void;
}

export default function NotificationBell({ onNotificationClick }: NotificationBellProps) {
  const { notifications, unreadCount, isLoading, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!panelRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [open]);

  async function handleItemClick(notification: AppNotification) {
    if (!notification.readAt) {
      await markRead(notification.id);
    }
    setOpen(false);
    onNotificationClick?.(notification);
  }

  return (
    <div ref={panelRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.04] text-cream/70 transition-colors hover:border-orange/40 hover:bg-orange/10 hover:text-orange"
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
      >
        <Bell className="h-[18px] w-[18px]" strokeWidth={1.75} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange px-1 font-mono text-[10px] font-semibold text-background">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="student-glass absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[min(100vw-2rem,22rem)] overflow-hidden !rounded-2xl !p-0 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3">
            <div>
              <p className="font-dm text-sm font-semibold text-cream">Notifications</p>
              <p className="font-dm text-xs text-cream/50">
                {isLoading ? "Loading…" : `${unreadCount} unread`}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => void markAllRead()}
                className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-orange transition-colors hover:text-orange/80"
              >
                <CheckCheck className="h-3.5 w-3.5" strokeWidth={1.75} />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[min(24rem,60vh)] overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-8 text-center font-dm text-sm text-cream/50">
                No notifications yet.
              </p>
            ) : (
              notifications.map((notification) => {
                const Icon = kindIcons[notification.kind];
                const unread = !notification.readAt;
                const content = (
                  <>
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                        unread
                          ? "bg-orange/15 text-orange"
                          : "bg-white/[0.06] text-cream/45"
                      }`}
                    >
                      <Icon className="h-4 w-4" strokeWidth={1.75} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-start justify-between gap-2">
                        <span
                          className={`block truncate font-dm text-sm ${
                            unread ? "font-semibold text-cream" : "text-cream/75"
                          }`}
                        >
                          {notification.title}
                        </span>
                        {unread && (
                          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-orange" />
                        )}
                      </span>
                      {notification.body && (
                        <span className="mt-0.5 line-clamp-2 block font-dm text-xs leading-snug text-cream/55">
                          {notification.body}
                        </span>
                      )}
                      <span className="mt-1 block font-mono text-[10px] uppercase tracking-wider text-cream/35">
                        {formatWhen(notification.createdAt)}
                      </span>
                    </span>
                  </>
                );

                const rowClass =
                  "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.04]";

                if (notification.href) {
                  return (
                    <Link
                      key={notification.id}
                      href={notification.href}
                      onClick={() => void handleItemClick(notification)}
                      className={rowClass}
                    >
                      {content}
                    </Link>
                  );
                }

                return (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => void handleItemClick(notification)}
                    className={rowClass}
                  >
                    {content}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
