import { NextResponse } from "next/server";
import { SERVER_ERROR_MESSAGE } from "@/lib/security/api-errors";
import {
  listNotificationsForUser,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/notifications/store";
import {
  markAllAnnouncementsRead,
  markAnnouncementRead,
} from "@/lib/members/announcement-states";
import { getAdminUser } from "@/lib/supabase/require-admin";
import { getStudentUser } from "@/lib/supabase/require-student";

async function resolveUserContext() {
  const admin = await getAdminUser();
  if (admin) {
    return { userId: admin.id, studentId: null as string | null };
  }

  const student = await getStudentUser();
  if (student) {
    return { userId: student.user.id, studentId: student.user.id };
  }

  return null;
}

export async function POST(request: Request) {
  const context = await resolveUserContext();
  if (!context) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId, studentId } = context;

  try {
    const body = await request.json();
    const action = String(body.action ?? "");

    if (action === "list") {
      const notifications = await listNotificationsForUser(userId);
      const unreadCount = notifications.filter((n) => !n.readAt).length;
      return NextResponse.json({ ok: true, notifications, unreadCount });
    }

    if (action === "mark-read") {
      const id = String(body.id ?? "").trim();
      if (!id) {
        return NextResponse.json({ error: "id is required" }, { status: 400 });
      }

      const notifications = await listNotificationsForUser(userId);
      const notification = notifications.find((item) => item.id === id);

      await markNotificationRead(userId, id);

      if (
        studentId &&
        notification?.kind === "announcement" &&
        notification.referenceId
      ) {
        await markAnnouncementRead(studentId, notification.referenceId);
      }

      return NextResponse.json({ ok: true });
    }

    if (action === "mark-all-read") {
      const notifications = await listNotificationsForUser(userId);
      const unreadAnnouncementIds = notifications
        .filter(
          (item) => !item.readAt && item.kind === "announcement" && item.referenceId
        )
        .map((item) => item.referenceId as string);

      await markAllNotificationsRead(userId);

      if (studentId && unreadAnnouncementIds.length > 0) {
        await markAllAnnouncementsRead(studentId, unreadAnnouncementIds);
      }

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("[notifications]", error);
    return NextResponse.json({ error: SERVER_ERROR_MESSAGE }, { status: 500 });
  }
}
