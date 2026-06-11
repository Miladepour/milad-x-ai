"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
import { isValidLocale, type UrlLocale } from "@/lib/i18n/config";
import { learnAnnouncementsPath } from "@/lib/members/paths";
import { resolveNotificationHref } from "@/lib/notifications/href";
import type { AppNotification, NotificationKind } from "@/lib/notifications/types";

const kindIcons: Record<NotificationKind, LucideIcon> = {
  contact: MessageSquare,
  waitlist: Users,
  announcement: Megaphone,
  system: Mail,
};

function localeFromPathname(pathname: string): UrlLocale {
  const segment = pathname.split("/").filter(Boolean)[0];
  return isValidLocale(segment) ? segment : "en";
}

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

interface PanelPosition {
  top: number;
  left: number;
  width: number;
}

interface NotificationBellProps {
  onNotificationClick?: (notification: AppNotification) => void;
}

export default function NotificationBell({ onNotificationClick }: NotificationBellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = localeFromPathname(pathname);
  const announcementsHref = learnAnnouncementsPath(locale);
  const isStudentPortal = pathname.includes("/learn");

  const { notifications, unreadCount, isLoading, markRead, markAllRead } = useNotifications();
  const unreadNotifications = notifications.filter((item) => !item.readAt);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [panelPosition, setPanelPosition] = useState<PanelPosition | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  function updatePanelPosition() {
    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const width = Math.min(window.innerWidth - 32, 352);
    const left = Math.max(16, Math.min(rect.right - width, window.innerWidth - width - 16));

    setPanelPosition({
      top: rect.bottom + 8,
      left,
      width,
    });
  }

  useLayoutEffect(() => {
    if (!open) {
      setPanelPosition(null);
      return;
    }

    updatePanelPosition();

    window.addEventListener("resize", updatePanelPosition);
    window.addEventListener("scroll", updatePanelPosition, true);

    return () => {
      window.removeEventListener("resize", updatePanelPosition);
      window.removeEventListener("scroll", updatePanelPosition, true);
    };
  }, [open]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || panelRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    if (open) {
      document.addEventListener("mousedown", handleClick);
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("mousedown", handleClick);
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [open]);

  async function handleItemClick(notification: AppNotification) {
    if (!notification.readAt) {
      await markRead(notification.id);
      if (isStudentPortal) {
        router.refresh();
      }
    }
    setOpen(false);
    onNotificationClick?.(notification);
  }

  function resolveHref(notification: AppNotification): string {
    return resolveNotificationHref(notification, locale) ?? announcementsHref;
  }

  const panel =
    open && panelPosition ? (
      <div
        ref={panelRef}
        className="student-glass fixed z-[200] overflow-hidden !rounded-2xl !p-0 shadow-2xl"
        style={{
          top: panelPosition.top,
          left: panelPosition.left,
          width: panelPosition.width,
        }}
      >
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
              onClick={() => {
                void markAllRead().then(() => {
                  if (isStudentPortal) router.refresh();
                });
              }}
              className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-orange transition-colors hover:text-orange/80"
            >
              <CheckCheck className="h-3.5 w-3.5" strokeWidth={1.75} />
              Mark all read
            </button>
          )}
        </div>

        <div className="max-h-[min(24rem,60vh)] overflow-y-auto overscroll-contain">
          {unreadNotifications.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="font-dm text-sm text-cream/50">
                {notifications.length === 0
                  ? "No notifications yet."
                  : "You're all caught up."}
              </p>
              {isStudentPortal && notifications.length > 0 && (
                <Link
                  href={announcementsHref}
                  onClick={() => setOpen(false)}
                  className="mt-3 inline-block font-mono text-[10px] uppercase tracking-widest text-orange transition-colors hover:text-cream"
                >
                  View announcements
                </Link>
              )}
            </div>
          ) : (
            unreadNotifications.map((notification) => {
              const Icon = kindIcons[notification.kind];
              const href = resolveHref(notification);
              const content = (
                <>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange/15 text-orange">
                    <Icon className="h-4 w-4" strokeWidth={1.75} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-2">
                      <span className="block font-dm text-sm font-semibold leading-snug text-cream">
                        {notification.title}
                      </span>
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-orange" />
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

              return (
                <Link
                  key={notification.id}
                  href={href}
                  onClick={() => void handleItemClick(notification)}
                  className={rowClass}
                >
                  {content}
                </Link>
              );
            })
          )}
        </div>

        {isStudentPortal && unreadNotifications.length > 0 && (
          <div className="border-t border-white/[0.08] px-4 py-3">
            <Link
              href={announcementsHref}
              onClick={() => setOpen(false)}
              className="block text-center font-mono text-[10px] uppercase tracking-widest text-orange transition-colors hover:text-cream"
            >
              View all announcements
            </Link>
          </div>
        )}
      </div>
    ) : null;

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.04] text-cream/70 transition-colors hover:border-orange/40 hover:bg-orange/10 hover:text-orange"
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <Bell className="h-[18px] w-[18px]" strokeWidth={1.75} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange px-1 font-mono text-[10px] font-semibold text-background">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {mounted && panel ? createPortal(panel, document.body) : null}
    </div>
  );
}
