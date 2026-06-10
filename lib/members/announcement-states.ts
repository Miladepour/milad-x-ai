import { createClient } from "@/lib/supabase/server";
import type { StudentAnnouncement, StudentAnnouncementWithState } from "@/lib/members/types";

interface AnnouncementReadRow {
  announcement_id: string;
  read_at: string | null;
  dismissed_at: string | null;
}

const SETUP_HINT =
  "Run supabase/patch-student-announcement-reads.sql in the Supabase SQL editor.";

function isMissingReadsTable(error: { message?: string; code?: string }): boolean {
  const msg = error.message ?? "";
  return (
    error.code === "PGRST205" ||
    (msg.includes("student_announcement_reads") &&
      (msg.includes("schema cache") || msg.includes("does not exist")))
  );
}

export async function getAnnouncementStatesForStudent(
  studentId: string,
  announcementIds: string[]
): Promise<Map<string, { readAt: string | null; dismissedAt: string | null }>> {
  const map = new Map<string, { readAt: string | null; dismissedAt: string | null }>();
  if (announcementIds.length === 0) return map;

  const supabase = createClient();
  const { data, error } = await supabase
    .from("student_announcement_reads")
    .select("announcement_id, read_at, dismissed_at")
    .eq("student_id", studentId)
    .in("announcement_id", announcementIds);

  if (error) {
    if (isMissingReadsTable(error)) return map;
    throw new Error(error.message);
  }

  for (const row of (data ?? []) as AnnouncementReadRow[]) {
    map.set(row.announcement_id, {
      readAt: row.read_at,
      dismissedAt: row.dismissed_at,
    });
  }

  return map;
}

export function mergeAnnouncementsWithState(
  announcements: StudentAnnouncement[],
  states: Map<string, { readAt: string | null; dismissedAt: string | null }>
): StudentAnnouncementWithState[] {
  return announcements.map((announcement) => {
    const state = states.get(announcement.id);
    const readAt = state?.readAt ?? null;
    const dismissedAt = state?.dismissedAt ?? null;
    return {
      ...announcement,
      readAt,
      dismissedAt,
      isRead: Boolean(readAt),
      isDismissed: Boolean(dismissedAt),
    };
  });
}

export async function markAnnouncementRead(
  studentId: string,
  announcementId: string
): Promise<void> {
  const supabase = createClient();
  const now = new Date().toISOString();

  const { data: existing } = await supabase
    .from("student_announcement_reads")
    .select("read_at, dismissed_at")
    .eq("student_id", studentId)
    .eq("announcement_id", announcementId)
    .maybeSingle();

  if (existing?.read_at) return;

  const { error } = await supabase.from("student_announcement_reads").upsert(
    {
      student_id: studentId,
      announcement_id: announcementId,
      read_at: now,
      dismissed_at: (existing as { dismissed_at: string | null } | null)?.dismissed_at ?? null,
    },
    { onConflict: "student_id,announcement_id" }
  );

  if (error) {
    if (isMissingReadsTable(error)) throw new Error(SETUP_HINT);
    throw new Error(error.message);
  }
}

export async function dismissAnnouncement(
  studentId: string,
  announcementId: string
): Promise<void> {
  const supabase = createClient();
  const now = new Date().toISOString();

  const { error } = await supabase.from("student_announcement_reads").upsert(
    {
      student_id: studentId,
      announcement_id: announcementId,
      read_at: now,
      dismissed_at: now,
    },
    { onConflict: "student_id,announcement_id" }
  );

  if (error) {
    if (isMissingReadsTable(error)) throw new Error(SETUP_HINT);
    throw new Error(error.message);
  }
}

export async function markAllAnnouncementsRead(
  studentId: string,
  announcementIds: string[]
): Promise<void> {
  if (announcementIds.length === 0) return;

  const supabase = createClient();
  const now = new Date().toISOString();
  const states = await getAnnouncementStatesForStudent(studentId, announcementIds);

  const rows = announcementIds
    .filter((id) => !states.get(id)?.readAt)
    .map((announcementId) => ({
      student_id: studentId,
      announcement_id: announcementId,
      read_at: now,
      dismissed_at: states.get(announcementId)?.dismissedAt ?? null,
    }));

  if (rows.length === 0) return;

  const { error } = await supabase
    .from("student_announcement_reads")
    .upsert(rows, { onConflict: "student_id,announcement_id" });

  if (error) {
    if (isMissingReadsTable(error)) throw new Error(SETUP_HINT);
    throw new Error(error.message);
  }
}
