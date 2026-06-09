"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { AppNotification, ToastNotification, ToastVariant } from "@/lib/notifications/types";

interface NotificationContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  toasts: ToastNotification[];
  isLoading: boolean;
  notify: (message: string, variant?: ToastVariant) => void;
  refresh: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  dismissToast: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

async function notificationsRequest(action: string, payload: Record<string, unknown> = {}) {
  const res = await fetch("/api/notifications", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ action, ...payload }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Notification request failed");
  return data;
}

function inferToastVariant(message: string): ToastVariant {
  const lower = message.toLowerCase();
  if (
    lower.includes("fail") ||
    lower.includes("error") ||
    lower.includes("invalid") ||
    lower.includes("required") ||
    lower.includes("could not")
  ) {
    return "error";
  }
  if (
    lower.includes("sent") ||
    lower.includes("saved") ||
    lower.includes("updated") ||
    lower.includes("published") ||
    lower.includes("deleted") ||
    lower.includes("extended") ||
    lower.includes("invite")
  ) {
    return "success";
  }
  return "info";
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const toastTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const timer = toastTimers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      toastTimers.current.delete(id);
    }
  }, []);

  const notify = useCallback(
    (message: string, variant?: ToastVariant) => {
      const trimmed = message.trim();
      if (!trimmed) return;

      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const toast: ToastNotification = {
        id,
        message: trimmed,
        variant: variant ?? inferToastVariant(trimmed),
      };

      setToasts((current) => [...current.slice(-4), toast]);

      const timer = setTimeout(() => dismissToast(id), 5000);
      toastTimers.current.set(id, timer);
    },
    [dismissToast]
  );

  const refresh = useCallback(async () => {
    try {
      const data = await notificationsRequest("list");
      setNotifications(data.notifications ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } catch {
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const markRead = useCallback(
    async (id: string) => {
      setNotifications((current) =>
        current.map((item) =>
          item.id === id ? { ...item, readAt: new Date().toISOString() } : item
        )
      );
      setUnreadCount((count) => Math.max(0, count - 1));

      try {
        await notificationsRequest("mark-read", { id });
        await refresh();
      } catch {
        await refresh();
      }
    },
    [refresh]
  );

  const markAllRead = useCallback(async () => {
    setNotifications((current) =>
      current.map((item) => ({ ...item, readAt: item.readAt ?? new Date().toISOString() }))
    );
    setUnreadCount(0);

    try {
      await notificationsRequest("mark-all-read");
      await refresh();
    } catch {
      await refresh();
    }
  }, [refresh]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    function handleFocus() {
      void refresh();
    }
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [refresh]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      void refresh();
    }, 60_000);
    return () => window.clearInterval(interval);
  }, [refresh]);

  useEffect(() => {
    return () => {
      toastTimers.current.forEach((timer) => clearTimeout(timer));
      toastTimers.current.clear();
    };
  }, []);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      toasts,
      isLoading,
      notify,
      refresh,
      markRead,
      markAllRead,
      dismissToast,
    }),
    [
      notifications,
      unreadCount,
      toasts,
      isLoading,
      notify,
      refresh,
      markRead,
      markAllRead,
      dismissToast,
    ]
  );

  return (
    <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return context;
}

export function useOptionalNotifications() {
  return useContext(NotificationContext);
}
