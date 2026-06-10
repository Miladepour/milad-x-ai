import { NextResponse } from "next/server";
import { SERVER_ERROR_MESSAGE } from "@/lib/security/api-errors";
import {
  listNotificationsForUser,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/notifications/store";
import { getAdminUser } from "@/lib/supabase/require-admin";
import { getStudentUser } from "@/lib/supabase/require-student";

async function resolveUser() {
  const admin = await getAdminUser();
  if (admin) return admin;
  const student = await getStudentUser();
  return student?.user ?? null;
}

export async function POST(request: Request) {
  const user = await resolveUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const action = String(body.action ?? "");

    if (action === "list") {
      const notifications = await listNotificationsForUser(user.id);
      const unreadCount = notifications.filter((n) => !n.readAt).length;
      return NextResponse.json({ ok: true, notifications, unreadCount });
    }

    if (action === "mark-read") {
      const id = String(body.id ?? "").trim();
      if (!id) {
        return NextResponse.json({ error: "id is required" }, { status: 400 });
      }
      await markNotificationRead(user.id, id);
      return NextResponse.json({ ok: true });
    }

    if (action === "mark-all-read") {
      await markAllNotificationsRead(user.id);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("[notifications]", error);
    return NextResponse.json({ error: SERVER_ERROR_MESSAGE }, { status: 500 });
  }
}
