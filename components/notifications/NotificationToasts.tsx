"use client";

import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { useNotifications } from "@/components/notifications/NotificationProvider";

const variantStyles = {
  success: {
    border: "border-emerald-400/30",
    bg: "bg-emerald-500/10",
    text: "text-emerald-200",
    icon: CheckCircle2,
  },
  error: {
    border: "border-red-400/30",
    bg: "bg-red-500/10",
    text: "text-red-200",
    icon: XCircle,
  },
  info: {
    border: "border-orange/30",
    bg: "bg-orange/10",
    text: "text-orange",
    icon: Info,
  },
} as const;

export default function NotificationToasts() {
  const { toasts, dismissToast } = useNotifications();

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[70] flex w-[min(100vw-2rem,22rem)] flex-col gap-2">
      {toasts.map((toast) => {
        const styles = variantStyles[toast.variant];
        const Icon = styles.icon;
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto student-glass flex items-start gap-3 border px-4 py-3 shadow-2xl ${styles.border} ${styles.bg}`}
          >
            <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${styles.text}`} strokeWidth={1.75} />
            <p className={`flex-1 font-dm text-sm leading-snug ${styles.text}`}>{toast.message}</p>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="shrink-0 text-cream/45 transition-colors hover:text-cream"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
