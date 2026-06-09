export type NotificationKind = "contact" | "waitlist" | "announcement" | "system";

export type ToastVariant = "success" | "error" | "info";

export interface AppNotification {
  id: string;
  userId: string;
  kind: NotificationKind;
  title: string;
  body: string;
  href: string | null;
  referenceId: string | null;
  readAt: string | null;
  createdAt: string;
}

export interface ToastNotification {
  id: string;
  message: string;
  variant: ToastVariant;
}
