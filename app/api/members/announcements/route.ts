import { NextResponse } from "next/server";
import {
  dismissAnnouncement,
  markAllAnnouncementsRead,
  markAnnouncementRead,
} from "@/lib/members/announcement-states";
import { listAnnouncementsForStudent } from "@/lib/members/store";
import { markNotificationsReadByReference } from "@/lib/notifications/store";
import { getStudentUser } from "@/lib/supabase/require-student";

export async function POST(request: Request) {
  const student = await getStudentUser();
  if (!student) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const action = String(body.action ?? "");

    if (action === "list") {
      const announcements = await listAnnouncementsForStudent(
        student.user.id,
        student.profile.locale,
        { includeDismissed: true }
      );
      const unreadCount = announcements.filter(
        (item) => !item.isRead && !item.isDismissed
      ).length;
      return NextResponse.json({ ok: true, announcements, unreadCount });
    }

    if (action === "mark-read") {
      const announcementId = String(body.announcementId ?? "").trim();
      if (!announcementId) {
        return NextResponse.json({ error: "announcementId is required" }, { status: 400 });
      }
      await markAnnouncementRead(student.user.id, announcementId);
      await markNotificationsReadByReference(
        student.user.id,
        "announcement",
        announcementId
      );
      return NextResponse.json({ ok: true });
    }

    if (action === "mark-all-read") {
      const announcements = await listAnnouncementsForStudent(
        student.user.id,
        student.profile.locale,
        { includeDismissed: false }
      );
      const unreadIds = announcements.filter((item) => !item.isRead).map((item) => item.id);
      await markAllAnnouncementsRead(student.user.id, unreadIds);
      for (const id of unreadIds) {
        await markNotificationsReadByReference(student.user.id, "announcement", id);
      }
      return NextResponse.json({ ok: true });
    }

    if (action === "dismiss") {
      const announcementId = String(body.announcementId ?? "").trim();
      if (!announcementId) {
        return NextResponse.json({ error: "announcementId is required" }, { status: 400 });
      }
      await dismissAnnouncement(student.user.id, announcementId);
      await markNotificationsReadByReference(
        student.user.id,
        "announcement",
        announcementId
      );
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
