import { learnAnnouncementsPath } from "@/lib/members/paths";
import type { StudentAnnouncement } from "@/lib/members/types";
import type { AppNotification, NotificationKind } from "@/lib/notifications/types";
import { createClient, createServiceClient } from "@/lib/supabase/server";

interface NotificationRow {
  id: string;
  user_id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  href: string | null;
  reference_id: string | null;
  read_at: string | null;
  created_at: string;
}

const SETUP_HINT = "Run supabase/patch-user-notifications.sql in the Supabase SQL editor.";

function rowToNotification(row: NotificationRow): AppNotification {
  return {
    id: row.id,
    userId: row.user_id,
    kind: row.kind,
    title: row.title,
    body: row.body,
    href: row.href,
    referenceId: row.reference_id,
    readAt: row.read_at,
    createdAt: row.created_at,
  };
}

function isMissingNotificationsTable(error: { message?: string; code?: string }): boolean {
  const msg = error.message ?? "";
  return (
    error.code === "PGRST205" ||
    (msg.includes("user_notifications") &&
      (msg.includes("schema cache") || msg.includes("does not exist")))
  );
}

export async function listNotificationsForUser(userId: string): Promise<AppNotification[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("user_notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    if (isMissingNotificationsTable(error)) return [];
    throw new Error(error.message);
  }

  return (data as NotificationRow[]).map(rowToNotification);
}

export async function markNotificationRead(
  userId: string,
  notificationId: string
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("user_notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .eq("user_id", userId)
    .is("read_at", null);

  if (error) {
    if (isMissingNotificationsTable(error)) return;
    throw new Error(error.message);
  }
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("user_notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", userId)
    .is("read_at", null);

  if (error) {
    if (isMissingNotificationsTable(error)) return;
    throw new Error(error.message);
  }
}

export async function markNotificationsReadByReference(
  userId: string,
  kind: NotificationKind,
  referenceId: string
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("user_notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("kind", kind)
    .eq("reference_id", referenceId)
    .is("read_at", null);

  if (error) {
    if (isMissingNotificationsTable(error)) return;
    throw new Error(error.message);
  }
}

async function listAdminUserIds(): Promise<string[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase.from("admin_profiles").select("id");
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => row.id);
}

export async function notifyAdmins(options: {
  kind: Extract<NotificationKind, "contact" | "waitlist" | "system">;
  title: string;
  body: string;
  referenceId?: string;
}): Promise<void> {
  const supabase = createServiceClient();
  const adminIds = await listAdminUserIds();
  if (adminIds.length === 0) return;

  const rows = adminIds.map((userId) => ({
    user_id: userId,
    kind: options.kind,
    title: options.title,
    body: options.body,
    reference_id: options.referenceId ?? null,
  }));

  const { error } = await supabase.from("user_notifications").insert(rows);
  if (error) {
    if (isMissingNotificationsTable(error)) {
      console.warn("[notifications]", SETUP_HINT);
      return;
    }
    console.error("[notifications] notifyAdmins failed:", error.message);
  }
}

export async function notifyAdminsOfContactSubmission(options: {
  id: string;
  fullName: string;
  inquiryType: string;
}): Promise<void> {
  const inquiryLabel =
    options.inquiryType === "collaboration" ? "Collaboration" : "Private course";

  await notifyAdmins({
    kind: "contact",
    title: "New contact message",
    body: `${options.fullName} — ${inquiryLabel}`,
    referenceId: options.id,
  });
}

export async function notifyAdminsOfWaitlistSubmission(options: {
  id: string;
  fullName: string;
  courseSlug: string;
}): Promise<void> {
  await notifyAdmins({
    kind: "waitlist",
    title: "New waitlist signup",
    body: `${options.fullName} joined ${options.courseSlug.replace(/-/g, " ")}`,
    referenceId: options.id,
  });
}

export async function notifyStudentsForAnnouncement(
  announcement: StudentAnnouncement
): Promise<void> {
  if (!announcement.publishedAt) return;

  const supabase = createServiceClient();

  let students: Array<{ id: string; locale: "EN" | "FA" }> = [];

  if (announcement.audienceType === "student" && announcement.studentId) {
    const { data, error } = await supabase
      .from("student_profiles")
      .select("id, locale")
      .eq("id", announcement.studentId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    students = data ? [{ id: data.id, locale: data.locale }] : [];
  } else if (
    announcement.audienceType === "programs" &&
    announcement.programIds.length > 0
  ) {
    const { data, error } = await supabase
      .from("program_enrollments")
      .select("student_profiles(id, locale)")
      .in("program_id", announcement.programIds);
    if (error) throw new Error(error.message);
    const seen = new Set<string>();
    for (const row of data ?? []) {
      const profile = row.student_profiles;
      if (!profile || Array.isArray(profile)) continue;
      const student = profile as { id: string; locale: "EN" | "FA" };
      if (seen.has(student.id)) continue;
      seen.add(student.id);
      students.push(student);
    }
  } else {
    const { data, error } = await supabase.from("student_profiles").select("id, locale");
    if (error) throw new Error(error.message);
    students = (data ?? []) as Array<{ id: string; locale: "EN" | "FA" }>;
  }

  if (!students.length) return;

  const { data: existing, error: existingError } = await supabase
    .from("user_notifications")
    .select("user_id")
    .eq("kind", "announcement")
    .eq("reference_id", announcement.id);

  if (existingError && !isMissingNotificationsTable(existingError)) {
    throw new Error(existingError.message);
  }

  const existingIds = new Set((existing ?? []).map((row) => row.user_id));
  const excerpt =
    announcement.body.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 120) ||
    announcement.title;

  const rows = students
    .filter((student) => !existingIds.has(student.id))
    .map((student) => ({
      user_id: student.id,
      kind: "announcement" as const,
      title: announcement.title,
      body: excerpt,
      href: learnAnnouncementsPath(student.locale === "FA" ? "fa" : "en"),
      reference_id: announcement.id,
    }));

  if (rows.length === 0) return;

  const { error } = await supabase.from("user_notifications").insert(rows);
  if (error) {
    if (isMissingNotificationsTable(error)) {
      console.warn("[notifications]", SETUP_HINT);
      return;
    }
    console.error("[notifications] notifyStudentsForAnnouncement failed:", error.message);
  }
}
