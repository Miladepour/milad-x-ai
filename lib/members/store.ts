import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import {
  computeProgressPercent,
  isEnrollmentActive,
  resolveEnrollmentStatus,
} from "./access";
import {
  enrollmentRowToEnrollment,
  memberProgramRowToProgram,
  programLessonRowToLesson,
  progressRowToProgress,
  studentProfileRowToProfile,
  usefulLinksToJson,
  type MemberProgramRow,
  type ProgramEnrollmentRow,
  type ProgramLessonRow,
  type StudentProfileRow,
} from "./mappers";
import { internalToUrlLocale } from "@/lib/i18n/config";
import { accountSetPasswordPath, learnPath } from "@/lib/members/paths";
import { startOfTodayIso } from "./dates";
import type {
  AddEnrollmentPayload,
  AnnouncementLocale,
  EnrollmentWithDetails,
  InviteStudentPayload,
  LessonProgress,
  MemberProgram,
  MemberProgramPayload,
  PaymentCurrency,
  ProgramEnrollment,
  ProgramLesson,
  ProgramLessonPayload,
  StudentAnnouncement,
  StudentAnnouncementPayload,
  StudentDashboardProgram,
  StudentProfile,
  StudentWithEnrollments,
  UpdateStudentPayload,
} from "./types";

function normalizeSlug(value: string, fallbackSeed?: string): string {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
  if (slug) return slug;

  const fromSeed = (fallbackSeed ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  if (fromSeed) return fromSeed;

  return `program-${crypto.randomUUID().replace(/-/g, "").slice(0, 8)}`;
}

// ---------------------------------------------------------------------------
// Admin reads (service role via authenticated admin session in API)
// ---------------------------------------------------------------------------

export async function listProgramsAdmin(): Promise<MemberProgram[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("member_programs")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);
  return (data as MemberProgramRow[]).map(memberProgramRowToProgram);
}

export async function getProgramAdmin(idOrSlug: string): Promise<{
  program: MemberProgram;
  lessons: ProgramLesson[];
} | null> {
  const supabase = createClient();
  const isUuid = /^[0-9a-f-]{36}$/i.test(idOrSlug);

  const query = supabase.from("member_programs").select("*");
  const { data: programData, error } = isUuid
    ? await query.eq("id", idOrSlug).maybeSingle()
    : await query.eq("slug", idOrSlug).maybeSingle();

  if (error) throw new Error(error.message);
  if (!programData) return null;

  const program = memberProgramRowToProgram(programData as MemberProgramRow);

  const { data: lessonsData, error: lessonsError } = await supabase
    .from("program_lessons")
    .select("*")
    .eq("program_id", program.id)
    .order("sort_order", { ascending: true });

  if (lessonsError) throw new Error(lessonsError.message);

  return {
    program,
    lessons: (lessonsData as ProgramLessonRow[]).map(programLessonRowToLesson),
  };
}

export async function upsertProgramAdmin(
  payload: MemberProgramPayload
): Promise<MemberProgram> {
  const supabase = createClient();
  const slug = normalizeSlug(payload.slug || payload.title, payload.id);

  const row = {
    slug,
    title: payload.title.trim(),
    description: payload.description.trim(),
    cover_image: payload.coverImage ?? null,
    sort_order: payload.sortOrder,
    status: payload.status,
    useful_links: usefulLinksToJson(payload.usefulLinks),
  };

  if (payload.id) {
    const { data, error } = await supabase
      .from("member_programs")
      .update(row)
      .eq("id", payload.id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return memberProgramRowToProgram(data as MemberProgramRow);
  }

  const { data, error } = await supabase
    .from("member_programs")
    .insert(row)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return memberProgramRowToProgram(data as MemberProgramRow);
}

export async function upsertLessonAdmin(
  payload: ProgramLessonPayload
): Promise<ProgramLesson> {
  const supabase = createClient();

  const row = {
    program_id: payload.programId,
    title: payload.title.trim(),
    description: payload.description.trim(),
    video_url: payload.videoUrl?.trim() || null,
    sort_order: payload.sortOrder,
    duration_minutes: payload.durationMinutes ?? null,
    published_at: payload.published ? new Date().toISOString() : null,
  };

  if (payload.id) {
    const { data, error } = await supabase
      .from("program_lessons")
      .update(row)
      .eq("id", payload.id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return programLessonRowToLesson(data as ProgramLessonRow);
  }

  const { data, error } = await supabase
    .from("program_lessons")
    .insert(row)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return programLessonRowToLesson(data as ProgramLessonRow);
}

export async function reorderLessonsAdmin(
  programId: string,
  lessonIds: string[]
): Promise<void> {
  const supabase = createClient();
  await Promise.all(
    lessonIds.map((id, index) =>
      supabase
        .from("program_lessons")
        .update({ sort_order: index })
        .eq("id", id)
        .eq("program_id", programId)
    )
  );
}

export async function deleteLessonAdmin(lessonId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("program_lessons").delete().eq("id", lessonId);
  if (error) throw new Error(error.message);
}

async function enrichEnrollmentRow(
  supabase: ReturnType<typeof createClient>,
  row: ProgramEnrollmentRow & {
    student_profiles: StudentProfileRow | null;
    member_programs: MemberProgramRow | null;
  }
): Promise<EnrollmentWithDetails> {
  const enrollment = enrollmentRowToEnrollment(row);
  const program = row.member_programs
    ? memberProgramRowToProgram(row.member_programs)
    : undefined;
  const student = row.student_profiles
    ? studentProfileRowToProfile(row.student_profiles)
    : undefined;

  let completedLessons = 0;
  let totalLessons = 0;
  if (program) {
    const { data: lessons } = await supabase
      .from("program_lessons")
      .select("id")
      .eq("program_id", program.id);
    totalLessons = lessons?.length ?? 0;

    const { data: progress } = await supabase
      .from("lesson_progress")
      .select("id, completed_at, lesson_id")
      .eq("student_id", enrollment.studentId)
      .not("completed_at", "is", null);

    const lessonIds = new Set((lessons ?? []).map((l) => l.id));
    completedLessons = (progress ?? []).filter((p) =>
      lessonIds.has(p.lesson_id)
    ).length;
  }

  return {
    ...enrollment,
    student,
    program,
    completedLessons,
    totalLessons,
    progressPercent: computeProgressPercent(completedLessons, totalLessons),
  };
}

export async function listEnrollmentsAdmin(): Promise<EnrollmentWithDetails[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("program_enrollments")
    .select("*, student_profiles(*), member_programs(*)")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  const enrollments = (data ?? []) as Array<
    ProgramEnrollmentRow & {
      student_profiles: StudentProfileRow | null;
      member_programs: MemberProgramRow | null;
    }
  >;

  return Promise.all(enrollments.map((row) => enrichEnrollmentRow(supabase, row)));
}

export async function getStudentAdmin(
  studentId: string
): Promise<StudentWithEnrollments | null> {
  const supabase = createClient();
  const { data: profileData, error } = await supabase
    .from("student_profiles")
    .select("*")
    .eq("id", studentId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!profileData) return null;

  const { data: enrollmentRows, error: enrollError } = await supabase
    .from("program_enrollments")
    .select("*, student_profiles(*), member_programs(*)")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });

  if (enrollError) throw new Error(enrollError.message);

  const enrollments = await Promise.all(
    (enrollmentRows ?? []).map((row) =>
      enrichEnrollmentRow(
        supabase,
        row as ProgramEnrollmentRow & {
          student_profiles: StudentProfileRow | null;
          member_programs: MemberProgramRow | null;
        }
      )
    )
  );

  return {
    profile: studentProfileRowToProfile(profileData as StudentProfileRow),
    enrollments,
  };
}

export async function updateStudentAdmin(
  payload: UpdateStudentPayload
): Promise<StudentProfile> {
  const supabase = createClient();
  const row: Record<string, unknown> = {};
  if (payload.fullName !== undefined) row.full_name = payload.fullName.trim();
  if (payload.locale !== undefined) row.locale = payload.locale;
  if (payload.phone !== undefined) row.phone = payload.phone?.trim() || null;
  if (payload.notes !== undefined) row.notes = payload.notes?.trim() || null;

  const { data, error } = await supabase
    .from("student_profiles")
    .update(row)
    .eq("id", payload.studentId)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return studentProfileRowToProfile(data as StudentProfileRow);
}

export async function addEnrollmentAdmin(
  payload: AddEnrollmentPayload,
  invitedBy: string
): Promise<ProgramEnrollment> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("program_enrollments")
    .upsert(
      {
        student_id: payload.studentId,
        program_id: payload.programId,
        status: payload.status ?? "active",
        access_starts_at: payload.accessStartsAt,
        access_ends_at: payload.accessEndsAt ?? null,
        amount_paid: payload.amountPaid ?? null,
        currency: payload.currency ?? null,
        invited_by: invitedBy,
        invited_at: new Date().toISOString(),
      },
      { onConflict: "student_id,program_id" }
    )
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return enrollmentRowToEnrollment(data as ProgramEnrollmentRow);
}

export async function updateEnrollmentAdmin(
  enrollmentId: string,
  updates: Partial<{
    status: ProgramEnrollment["status"];
    accessStartsAt: string;
    accessEndsAt: string | null;
    amountPaid: number | null;
    currency: PaymentCurrency | null;
  }>
): Promise<ProgramEnrollment> {
  const supabase = createClient();
  const row: Record<string, unknown> = {};
  if (updates.status) row.status = updates.status;
  if (updates.accessStartsAt) row.access_starts_at = updates.accessStartsAt;
  if (updates.accessEndsAt !== undefined) row.access_ends_at = updates.accessEndsAt;
  if (updates.amountPaid !== undefined) row.amount_paid = updates.amountPaid;
  if (updates.currency !== undefined) row.currency = updates.currency;

  const { data, error } = await supabase
    .from("program_enrollments")
    .update(row)
    .eq("id", enrollmentId)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return enrollmentRowToEnrollment(data as ProgramEnrollmentRow);
}

// ---------------------------------------------------------------------------
// Student reads (cookie session + RLS)
// ---------------------------------------------------------------------------

export async function getStudentProfile(
  userId: string
): Promise<StudentProfile | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("student_profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return studentProfileRowToProfile(data as StudentProfileRow);
}

async function loadStudentDashboardProgram(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  program: MemberProgram,
  enrollment: ProgramEnrollment
): Promise<StudentDashboardProgram> {
  const { data: lessonsData } = await supabase
    .from("program_lessons")
    .select("*")
    .eq("program_id", program.id)
    .order("sort_order", { ascending: true });

  const lessons = (lessonsData as ProgramLessonRow[] ?? []).map(
    programLessonRowToLesson
  );

  const lessonIds = lessons.map((l) => l.id);
  let progressData: import("./mappers").LessonProgressRow[] = [];
  if (lessonIds.length > 0) {
    const { data } = await supabase
      .from("lesson_progress")
      .select("*")
      .eq("student_id", userId)
      .in("lesson_id", lessonIds);
    progressData = (data as import("./mappers").LessonProgressRow[] | null) ?? [];
  }

  const progressMap = new Map(
    progressData.map((p) => [p.lesson_id, progressRowToProgress(p)])
  );

  const completedLessons = lessons.filter((l) =>
    progressMap.get(l.id)?.completedAt
  ).length;

  let continueLesson: ProgramLesson | null = null;
  for (const lesson of lessons) {
    const prog = progressMap.get(lesson.id);
    if (!prog?.completedAt) {
      continueLesson = lesson;
      break;
    }
  }

  return {
    program,
    enrollment,
    lessons,
    progressPercent: computeProgressPercent(completedLessons, lessons.length),
    completedLessons,
    totalLessons: lessons.length,
    continueLesson,
  };
}

export async function getStudentDashboard(
  userId: string
): Promise<StudentDashboardProgram[]> {
  const supabase = createClient();

  const { data: enrollments, error } = await supabase
    .from("program_enrollments")
    .select("*, member_programs(*)")
    .eq("student_id", userId);

  if (error) throw new Error(error.message);

  const results: StudentDashboardProgram[] = [];

  for (const row of enrollments ?? []) {
    const enrollment = enrollmentRowToEnrollment(row as ProgramEnrollmentRow);
    if (!isEnrollmentActive(enrollment)) continue;

    let programRow = (row as { member_programs: MemberProgramRow | null })
      .member_programs;
    if (!programRow) {
      const { data } = await supabase
        .from("member_programs")
        .select("*")
        .eq("id", enrollment.programId)
        .maybeSingle();
      programRow = (data as MemberProgramRow | null) ?? null;
    }
    if (!programRow) continue;

    const program = memberProgramRowToProgram(programRow);
    if (!program.slug.trim()) continue;

    results.push(
      await loadStudentDashboardProgram(supabase, userId, program, enrollment)
    );
  }

  results.sort((a, b) => a.program.sortOrder - b.program.sortOrder);
  return results;
}

export async function getStudentProgram(
  userId: string,
  programSlug: string
): Promise<StudentDashboardProgram | null> {
  const slug = programSlug.trim().toLowerCase();
  if (!slug) return null;

  const supabase = createClient();

  const { data: programData, error: programError } = await supabase
    .from("member_programs")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (programError) throw new Error(programError.message);
  if (!programData) return null;

  const { data: enrollmentRow, error: enrollmentError } = await supabase
    .from("program_enrollments")
    .select("*")
    .eq("student_id", userId)
    .eq("program_id", programData.id)
    .maybeSingle();

  if (enrollmentError) throw new Error(enrollmentError.message);
  if (!enrollmentRow) return null;

  const enrollment = enrollmentRowToEnrollment(
    enrollmentRow as ProgramEnrollmentRow
  );
  if (!isEnrollmentActive(enrollment)) return null;

  const program = memberProgramRowToProgram(programData as MemberProgramRow);
  return loadStudentDashboardProgram(supabase, userId, program, enrollment);
}

export async function getStudentLesson(
  userId: string,
  programSlug: string,
  lessonId: string
): Promise<{
  program: MemberProgram;
  lesson: ProgramLesson;
  lessons: ProgramLesson[];
  progress: LessonProgress | null;
  enrollment: ProgramEnrollment;
} | null> {
  const programData = await getStudentProgram(userId, programSlug);
  if (!programData) return null;

  const lesson = programData.lessons.find((l) => l.id === lessonId);
  if (!lesson) return null;

  const supabase = createClient();
  const { data: progressData } = await supabase
    .from("lesson_progress")
    .select("*")
    .eq("student_id", userId)
    .eq("lesson_id", lessonId)
    .maybeSingle();

  await supabase
    .from("program_enrollments")
    .update({ last_accessed_at: new Date().toISOString() })
    .eq("student_id", userId)
    .eq("program_id", programData.program.id);

  return {
    program: programData.program,
    lesson,
    lessons: programData.lessons,
    progress: progressData
      ? progressRowToProgress(progressData as import("./mappers").LessonProgressRow)
      : null,
    enrollment: programData.enrollment,
  };
}

export async function upsertLessonProgress(
  userId: string,
  lessonId: string,
  updates: { lastPositionSeconds?: number; completed?: boolean }
): Promise<LessonProgress> {
  const supabase = createClient();

  const { data: existing } = await supabase
    .from("lesson_progress")
    .select("*")
    .eq("student_id", userId)
    .eq("lesson_id", lessonId)
    .maybeSingle();

  const row: Record<string, unknown> = {
    student_id: userId,
    lesson_id: lessonId,
    updated_at: new Date().toISOString(),
  };

  if (updates.lastPositionSeconds !== undefined) {
    row.last_position_seconds = updates.lastPositionSeconds;
  }
  if (updates.completed) {
    row.completed_at = new Date().toISOString();
  }

  if (existing) {
    const { data, error } = await supabase
      .from("lesson_progress")
      .update(row)
      .eq("id", existing.id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return progressRowToProgress(data as import("./mappers").LessonProgressRow);
  }

  const { data, error } = await supabase
    .from("lesson_progress")
    .insert(row)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return progressRowToProgress(data as import("./mappers").LessonProgressRow);
}

// ---------------------------------------------------------------------------
// Invite (service role)
// ---------------------------------------------------------------------------

export async function inviteStudentAdmin(
  payload: InviteStudentPayload,
  invitedBy: string
): Promise<{ student: StudentProfile; enrollment: ProgramEnrollment; inviteLink: string }> {
  const service = createServiceClient();
  const email = payload.email.trim().toLowerCase();
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "https://www.mxaiacademy.com";

  const urlLocale = internalToUrlLocale(payload.locale);
  const setPasswordPath = accountSetPasswordPath(urlLocale);
  const learnRedirectPath = learnPath(urlLocale);
  const authCallbackUrl = (nextPath: string) =>
    `${siteUrl}/auth/callback?next=${encodeURIComponent(nextPath)}`;
  const fullName = payload.fullName.trim();

  // generateLink only — do NOT use inviteUserByEmail (that sends a second Supabase email).
  const { data: inviteLinkData, error: inviteLinkError } =
    await service.auth.admin.generateLink({
      type: "invite",
      email,
      options: {
        redirectTo: authCallbackUrl(setPasswordPath),
        data: { full_name: fullName },
      },
    });

  let linkData = inviteLinkData;
  let linkError = inviteLinkError;

  if (linkError || !linkData?.user) {
    const magic = await service.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: {
        redirectTo: authCallbackUrl(learnRedirectPath),
        data: { full_name: fullName },
      },
    });
    linkData = magic.data;
    linkError = magic.error;
  }

  if (linkError || !linkData?.user) {
    throw new Error(linkError?.message ?? "Could not create invite link");
  }

  const userId = linkData.user.id;
  const inviteLink =
    linkData.properties?.action_link ?? `${siteUrl}${setPasswordPath}`;

  const accessStartsAt =
    payload.accessStartsAt?.trim() || startOfTodayIso();
  const accessEndsAt = payload.accessEndsAt ?? null;

  const { data: profileData, error: profileError } = await service
    .from("student_profiles")
    .upsert(
      {
        id: userId,
        email,
        full_name: payload.fullName.trim(),
        locale: payload.locale,
        phone: payload.phone?.trim() || null,
        notes: payload.notes?.trim() || null,
      },
      { onConflict: "id" }
    )
    .select("*")
    .single();

  if (profileError) throw new Error(profileError.message);

  const { data: enrollmentData, error: enrollmentError } = await service
    .from("program_enrollments")
    .upsert(
      {
        student_id: userId,
        program_id: payload.programId,
        status: "active",
        access_starts_at: accessStartsAt,
        access_ends_at: accessEndsAt,
        amount_paid: payload.amountPaid ?? null,
        currency: payload.currency ?? null,
        invited_by: invitedBy,
        invited_at: new Date().toISOString(),
      },
      { onConflict: "student_id,program_id" }
    )
    .select("*")
    .single();

  if (enrollmentError) throw new Error(enrollmentError.message);

  return {
    student: studentProfileRowToProfile(profileData as StudentProfileRow),
    enrollment: enrollmentRowToEnrollment(enrollmentData as ProgramEnrollmentRow),
    inviteLink,
  };
}

export async function syncExpiredEnrollments(): Promise<void> {
  const service = createServiceClient();
  const { data } = await service
    .from("program_enrollments")
    .select("*")
    .in("status", ["invited", "active"])
    .not("access_ends_at", "is", null)
    .lt("access_ends_at", new Date().toISOString());

  for (const row of data ?? []) {
    const resolved = resolveEnrollmentStatus(enrollmentRowToEnrollment(row as ProgramEnrollmentRow));
    if (resolved === "expired") {
      await service
        .from("program_enrollments")
        .update({ status: "expired" })
        .eq("id", row.id);
    }
  }
}

// ---------------------------------------------------------------------------
// Student email broadcast
// ---------------------------------------------------------------------------

export type StudentEmailAudience =
  | { type: "all" }
  | { type: "student"; studentId: string }
  | { type: "program"; programId: string };

function dedupeStudentsByEmail(students: StudentProfile[]): StudentProfile[] {
  const seen = new Set<string>();
  const result: StudentProfile[] = [];
  for (const student of students) {
    const key = student.email.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(student);
  }
  return result.sort((a, b) =>
    (a.fullName || a.email).localeCompare(b.fullName || b.email)
  );
}

export async function resolveStudentEmailRecipients(
  audience: StudentEmailAudience
): Promise<StudentProfile[]> {
  const supabase = createClient();

  if (audience.type === "student") {
    const student = await getStudentAdmin(audience.studentId);
    return student ? [student.profile] : [];
  }

  if (audience.type === "program") {
    const { data, error } = await supabase
      .from("program_enrollments")
      .select("student_profiles(*)")
      .eq("program_id", audience.programId);

    if (error) throw new Error(error.message);

    const students = (data ?? [])
      .map((row) => {
        const profile = row.student_profiles;
        if (!profile || Array.isArray(profile)) return null;
        return studentProfileRowToProfile(profile as StudentProfileRow);
      })
      .filter((profile): profile is StudentProfile => profile !== null);

    return dedupeStudentsByEmail(students);
  }

  const { data, error } = await supabase
    .from("student_profiles")
    .select("*")
    .order("full_name", { ascending: true });

  if (error) throw new Error(error.message);
  return dedupeStudentsByEmail(
    (data as StudentProfileRow[]).map(studentProfileRowToProfile)
  );
}

// ---------------------------------------------------------------------------
// Student announcements
// ---------------------------------------------------------------------------

interface StudentAnnouncementRow {
  id: string;
  title: string;
  body: string;
  locale: AnnouncementLocale;
  published_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

function announcementRowToAnnouncement(row: StudentAnnouncementRow): StudentAnnouncement {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    locale: row.locale,
    publishedAt: row.published_at,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const ANNOUNCEMENTS_SETUP_HINT =
  "Run supabase/patch-student-announcements.sql in the Supabase SQL editor.";

function isMissingAnnouncementsTable(error: { message?: string; code?: string }): boolean {
  const msg = error.message ?? "";
  return (
    error.code === "PGRST205" ||
    (msg.includes("student_announcements") &&
      (msg.includes("schema cache") || msg.includes("does not exist")))
  );
}

export async function listAnnouncementsAdmin(): Promise<StudentAnnouncement[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("student_announcements")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    if (isMissingAnnouncementsTable(error)) return [];
    throw new Error(error.message);
  }
  return (data as StudentAnnouncementRow[]).map(announcementRowToAnnouncement);
}

export async function upsertAnnouncementAdmin(
  payload: StudentAnnouncementPayload
): Promise<StudentAnnouncement> {
  const supabase = createClient();
  const baseRow = {
    title: payload.title.trim(),
    body: payload.body.trim(),
    locale: payload.locale,
    expires_at: payload.expiresAt ?? null,
    updated_at: new Date().toISOString(),
  };

  if (payload.id) {
    const { data: existing } = await supabase
      .from("student_announcements")
      .select("published_at")
      .eq("id", payload.id)
      .maybeSingle();

    const publishedAt = payload.published
      ? (existing as { published_at: string | null } | null)?.published_at ??
        new Date().toISOString()
      : null;

    const { data, error } = await supabase
      .from("student_announcements")
      .update({ ...baseRow, published_at: publishedAt })
      .eq("id", payload.id)
      .select("*")
      .single();
    if (error) {
      if (isMissingAnnouncementsTable(error)) throw new Error(ANNOUNCEMENTS_SETUP_HINT);
      throw new Error(error.message);
    }
    return announcementRowToAnnouncement(data as StudentAnnouncementRow);
  }

  const row = {
    ...baseRow,
    published_at: payload.published ? new Date().toISOString() : null,
  };

  const { data, error } = await supabase
    .from("student_announcements")
    .insert(row)
    .select("*")
    .single();
  if (error) {
    if (isMissingAnnouncementsTable(error)) throw new Error(ANNOUNCEMENTS_SETUP_HINT);
    throw new Error(error.message);
  }
  return announcementRowToAnnouncement(data as StudentAnnouncementRow);
}

export async function deleteAnnouncementAdmin(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("student_announcements").delete().eq("id", id);
  if (error) {
    if (isMissingAnnouncementsTable(error)) throw new Error(ANNOUNCEMENTS_SETUP_HINT);
    throw new Error(error.message);
  }
}

export async function listAnnouncementsForStudent(
  studentLocale: "EN" | "FA"
): Promise<StudentAnnouncement[]> {
  const supabase = createClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("student_announcements")
    .select("*")
    .not("published_at", "is", null)
    .lte("published_at", now)
    .or(`expires_at.is.null,expires_at.gt."${now}"`)
    .in("locale", [studentLocale, "ALL"])
    .order("published_at", { ascending: false })
    .limit(10);

  if (error) {
    if (isMissingAnnouncementsTable(error)) return [];
    throw new Error(error.message);
  }
  return (data as StudentAnnouncementRow[]).map(announcementRowToAnnouncement);
}
