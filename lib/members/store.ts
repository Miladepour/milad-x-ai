import { cache } from "react";
import { createAdminDbClient } from "@/lib/supabase/admin-client";
import { createClient } from "@/lib/supabase/server";
import { certificatesByProgramIdForStudent } from "@/lib/members/certificate-store";
import {
  listBonusLinksAdmin,
  saveBonusLinksAdmin,
  studentHasBonusProgramAccess,
} from "@/lib/members/bonus-store";
import {
  getAnnouncementStatesForStudent,
  mergeAnnouncementsWithState,
} from "@/lib/members/announcement-states";
import { normalizeAnnouncementLink } from "@/lib/members/announcement-utils";
import { notifyStudentsForAnnouncement } from "@/lib/notifications/store";
import { createServiceClient } from "@/lib/supabase/server";
import {
  computeProgressPercent,
  isEnrollmentActive,
  resolveEnrollmentStatus,
  shouldShowInExpiredPrograms,
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
import { resolveStudentAccountActivation } from "./student-activation";
import { resolveContinueLesson } from "./continue-watching";
import { collectUsefulLinks } from "./learn-content";
import { listStudentDevices } from "@/lib/members/device-store";
import { accountSetPasswordPath, learnPath } from "@/lib/members/paths";
import { startOfTodayIso, dateInputToEndIso } from "./dates";
import {
  computeExtendedEndDate,
  type ExtendAccessMode,
} from "./extend-access";
import type {
  AddEnrollmentPayload,
  AnnouncementLocale,
  EnrollmentWithDetails,
  InviteStudentPayload,
  StudentInviteCheck,
  LessonProgress,
  MemberProgram,
  MemberProgramPayload,
  PaymentCurrency,
  ProgramEnrollment,
  ProgramLesson,
  ProgramLessonPayload,
  StudentAnnouncement,
  StudentAnnouncementAudienceType,
  StudentAnnouncementPayload,
  StudentAnnouncementWithState,
  StudentDashboardProgram,
  StudentProfile,
  StudentProfileAccount,
  StudentProfileEnrollmentSummary,
  StudentSelfUpdatePayload,
  StudentWithEnrollments,
  UpdateStudentPayload,
  UsefulLink,
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

export async function listProgramsAdmin(options?: {
  programType?: import("./types").ProgramType;
}): Promise<MemberProgram[]> {
  const supabase = createClient();
  let query = supabase.from("member_programs").select("*");
  if (options?.programType) {
    query = query.eq("program_type", options.programType);
  }
  const { data, error } = await query.order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);
  return (data as MemberProgramRow[]).map(memberProgramRowToProgram);
}

export async function getProgramAdmin(idOrSlug: string): Promise<{
  program: MemberProgram;
  lessons: ProgramLesson[];
  bonusLinks: import("./types").ProgramBonusLink[];
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

  const bonusLinks =
    program.programType === "bonus"
      ? await listBonusLinksAdmin(program.id)
      : [];

  return {
    program,
    lessons: (lessonsData as ProgramLessonRow[]).map(programLessonRowToLesson),
    bonusLinks,
  };
}

export async function upsertProgramAdmin(
  payload: MemberProgramPayload
): Promise<MemberProgram> {
  const supabase = createAdminDbClient();
  const titleEn = payload.titleEn.trim();
  const titleFa = payload.titleFa.trim();
  const descriptionEn = payload.descriptionEn.trim();
  const descriptionFa = payload.descriptionFa.trim();
  const slug = normalizeSlug(
    payload.slug || titleEn || titleFa,
    payload.id
  );

  const programType = payload.programType === "bonus" ? "bonus" : "main";
  const isBonus = programType === "bonus";

  const row = {
    slug,
    title_en: titleEn,
    title_fa: titleFa,
    description_en: descriptionEn,
    description_fa: descriptionFa,
    title: titleEn || titleFa,
    description: descriptionEn || descriptionFa,
    cover_image: payload.coverImage ?? null,
    sort_order: payload.sortOrder,
    status: payload.status,
    useful_links: usefulLinksToJson(payload.usefulLinks),
    certificate_enabled: isBonus ? false : Boolean(payload.certificateEnabled),
    certificate_title_en: isBonus ? null : payload.certificateTitleEn?.trim() || null,
    certificate_title_fa: isBonus ? null : payload.certificateTitleFa?.trim() || null,
    certificate_hours:
      isBonus || payload.certificateHours == null || payload.certificateHours <= 0
        ? null
        : payload.certificateHours,
    coming_soon: isBonus ? false : Boolean(payload.comingSoon),
    program_type: programType,
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
  const supabase = createAdminDbClient();

  const titleEn = payload.titleEn.trim();
  const titleFa = payload.titleFa.trim();
  const bodyEn = payload.bodyEn.trim();
  const bodyFa = payload.bodyFa.trim();

  const row = {
    program_id: payload.programId,
    lesson_type: payload.lessonType,
    title_en: titleEn,
    title_fa: titleFa,
    body_en: bodyEn,
    body_fa: bodyFa,
    title: titleEn || titleFa,
    description: bodyEn || bodyFa,
    video_url: payload.lessonType === "video" ? payload.videoUrl?.trim() || null : null,
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
  const supabase = createAdminDbClient();
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
  const supabase = createAdminDbClient();
  const { error } = await supabase.from("program_lessons").delete().eq("id", lessonId);
  if (error) throw new Error(error.message);
}

async function deleteStudentProgramProgress(
  supabase: ReturnType<typeof createAdminDbClient>,
  studentId: string,
  programId: string
): Promise<void> {
  const { data: lessons, error: lessonsError } = await supabase
    .from("program_lessons")
    .select("id")
    .eq("program_id", programId);

  if (lessonsError) throw new Error(lessonsError.message);

  const lessonIds = (lessons ?? []).map((lesson) => lesson.id);
  if (lessonIds.length > 0) {
    const { error: progressError } = await supabase
      .from("lesson_progress")
      .delete()
      .eq("student_id", studentId)
      .in("lesson_id", lessonIds);
    if (progressError) throw new Error(progressError.message);

    const { error: quizError } = await supabase
      .from("lesson_quiz_attempts")
      .delete()
      .eq("student_id", studentId)
      .in("lesson_id", lessonIds);
    if (quizError) throw new Error(quizError.message);
  }

  const { error: certError } = await supabase
    .from("program_certificates")
    .delete()
    .eq("student_id", studentId)
    .eq("program_id", programId);
  if (certError) throw new Error(certError.message);
}

export async function deleteEnrollmentAdmin(enrollmentId: string): Promise<void> {
  const supabase = createAdminDbClient();

  const { data: enrollment, error: fetchError } = await supabase
    .from("program_enrollments")
    .select("id, student_id, program_id")
    .eq("id", enrollmentId)
    .maybeSingle();

  if (fetchError) throw new Error(fetchError.message);
  if (!enrollment) throw new Error("Enrollment not found");

  await deleteStudentProgramProgress(
    supabase,
    enrollment.student_id,
    enrollment.program_id
  );

  const { error } = await supabase
    .from("program_enrollments")
    .delete()
    .eq("id", enrollmentId);
  if (error) throw new Error(error.message);
}

export async function deleteProgramAdmin(programId: string): Promise<void> {
  const supabase = createAdminDbClient();

  const { data: lessons, error: lessonsError } = await supabase
    .from("program_lessons")
    .select("id")
    .eq("program_id", programId);
  if (lessonsError) throw new Error(lessonsError.message);

  const lessonIds = (lessons ?? []).map((lesson) => lesson.id);
  if (lessonIds.length > 0) {
    const { error: progressError } = await supabase
      .from("lesson_progress")
      .delete()
      .in("lesson_id", lessonIds);
    if (progressError) throw new Error(progressError.message);

    const { error: quizError } = await supabase
      .from("lesson_quiz_attempts")
      .delete()
      .in("lesson_id", lessonIds);
    if (quizError) throw new Error(quizError.message);
  }

  const { error: certError } = await supabase
    .from("program_certificates")
    .delete()
    .eq("program_id", programId);
  if (certError) throw new Error(certError.message);

  const { error: enrollmentError } = await supabase
    .from("program_enrollments")
    .delete()
    .eq("program_id", programId);
  if (enrollmentError) throw new Error(enrollmentError.message);

  const { error: lessonsDeleteError } = await supabase
    .from("program_lessons")
    .delete()
    .eq("program_id", programId);
  if (lessonsDeleteError) throw new Error(lessonsDeleteError.message);

  const { error } = await supabase.from("member_programs").delete().eq("id", programId);
  if (error) throw new Error(error.message);
}

export async function isLessonContentLockedForStudent(
  userId: string,
  lessonId: string
): Promise<boolean> {
  const supabase = createClient();

  const { data: lessonRow, error: lessonError } = await supabase
    .from("program_lessons")
    .select("program_id")
    .eq("id", lessonId)
    .maybeSingle();

  if (lessonError) throw new Error(lessonError.message);
  if (!lessonRow) return true;

  const [{ data: enrollmentRow, error: enrollmentError }, { data: programRow, error: programError }] =
    await Promise.all([
      supabase
        .from("program_enrollments")
        .select("*")
        .eq("student_id", userId)
        .eq("program_id", lessonRow.program_id)
        .maybeSingle(),
      supabase
        .from("member_programs")
        .select("coming_soon, program_type")
        .eq("id", lessonRow.program_id)
        .maybeSingle(),
    ]);

  if (enrollmentError) throw new Error(enrollmentError.message);
  if (programError) throw new Error(programError.message);
  if (!programRow) return true;

  if (programRow.program_type === "bonus") {
    const hasAccess = await studentHasBonusProgramAccess(
      userId,
      String(lessonRow.program_id)
    );
    return !hasAccess;
  }

  if (!enrollmentRow) return true;

  const enrollment = enrollmentRowToEnrollment(enrollmentRow as ProgramEnrollmentRow);
  if (!isEnrollmentActive(enrollment)) return true;

  return Boolean(programRow.coming_soon);
}

async function buildEnrollmentProgressContext(
  supabase: ReturnType<typeof createClient>,
  enrollments: Array<
    ProgramEnrollmentRow & {
      student_profiles: StudentProfileRow | null;
      member_programs: MemberProgramRow | null;
    }
  >
) {
  const programIds = Array.from(
    new Set(
      enrollments
        .map((row) => row.member_programs?.id)
        .filter((id): id is string => Boolean(id))
    )
  );
  const studentIds = Array.from(new Set(enrollments.map((row) => row.student_id)));

  const lessonsByProgram = new Map<string, string[]>();
  if (programIds.length > 0) {
    const { data: lessons, error: lessonsError } = await supabase
      .from("program_lessons")
      .select("id, program_id")
      .in("program_id", programIds);

    if (lessonsError) throw new Error(lessonsError.message);

    for (const lesson of lessons ?? []) {
      const existing = lessonsByProgram.get(lesson.program_id) ?? [];
      existing.push(lesson.id);
      lessonsByProgram.set(lesson.program_id, existing);
    }
  }

  const completedByStudent = new Map<string, Set<string>>();
  if (studentIds.length > 0) {
    const { data: progress, error: progressError } = await supabase
      .from("lesson_progress")
      .select("student_id, lesson_id")
      .in("student_id", studentIds)
      .not("completed_at", "is", null);

    if (progressError) throw new Error(progressError.message);

    for (const row of progress ?? []) {
      const existing = completedByStudent.get(row.student_id) ?? new Set<string>();
      existing.add(row.lesson_id);
      completedByStudent.set(row.student_id, existing);
    }
  }

  return { lessonsByProgram, completedByStudent };
}

function enrichEnrollmentRowWithContext(
  row: ProgramEnrollmentRow & {
    student_profiles: StudentProfileRow | null;
    member_programs: MemberProgramRow | null;
  },
  context: Awaited<ReturnType<typeof buildEnrollmentProgressContext>>
): EnrollmentWithDetails {
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
    const lessonIds = context.lessonsByProgram.get(program.id) ?? [];
    totalLessons = lessonIds.length;
    const completedSet = context.completedByStudent.get(enrollment.studentId);
    if (completedSet) {
      completedLessons = lessonIds.filter((id) => completedSet.has(id)).length;
    }
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

async function enrichEnrollmentRow(
  supabase: ReturnType<typeof createClient>,
  row: ProgramEnrollmentRow & {
    student_profiles: StudentProfileRow | null;
    member_programs: MemberProgramRow | null;
  }
): Promise<EnrollmentWithDetails> {
  const context = await buildEnrollmentProgressContext(supabase, [row]);
  return enrichEnrollmentRowWithContext(row, context);
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

  const context = await buildEnrollmentProgressContext(supabase, enrollments);
  return enrollments.map((row) => enrichEnrollmentRowWithContext(row, context));
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

  const certificatesByProgramId = await certificatesByProgramIdForStudent(studentId);
  const devices = await listStudentDevices(studentId);
  const profile = await enrichStudentProfileWithActivation(
    studentProfileRowToProfile(profileData as StudentProfileRow)
  );

  return {
    profile,
    enrollments,
    certificatesByProgramId,
    devices,
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
  const supabase = createAdminDbClient();
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
  const supabase = createAdminDbClient();
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

export async function bulkExtendProgramEnrollmentsAdmin(
  programId: string,
  options: {
    mode: ExtendAccessMode;
    days?: number;
    endDate?: string;
    enrollmentIds?: string[];
  }
): Promise<{ updated: number }> {
  const supabase = createAdminDbClient();
  let query = supabase.from("program_enrollments").select("*").eq("program_id", programId);

  if (options.enrollmentIds?.length) {
    query = query.in("id", options.enrollmentIds);
  }

  const { data, error } = await query;

  if (error) throw new Error(error.message);
  if (!data?.length) return { updated: 0 };

  let updated = 0;
  for (const row of data) {
    const enrollment = enrollmentRowToEnrollment(row as ProgramEnrollmentRow);
    const newEndInput = computeExtendedEndDate({
      mode: options.mode,
      accessEndsAt: enrollment.accessEndsAt,
      days: options.days,
      endDate: options.endDate,
    });
    if (!newEndInput) continue;

    const nextStatus =
      enrollment.status === "suspended" ? "suspended" : "active";

    await updateEnrollmentAdmin(enrollment.id, {
      status: nextStatus,
      accessEndsAt: dateInputToEndIso(newEndInput),
    });
    updated++;
  }

  return { updated };
}

// ---------------------------------------------------------------------------
// Student reads (cookie session + RLS)
// ---------------------------------------------------------------------------

export const getStudentProfile = cache(async function getStudentProfile(
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
});

export async function getStudentProfileAccount(
  userId: string
): Promise<StudentProfileAccount | null> {
  const supabase = createClient();
  const profile = await getStudentProfile(userId);
  if (!profile) return null;

  const { data, error } = await supabase
    .from("program_enrollments")
    .select("*, member_programs(*)")
    .eq("student_id", userId)
    .order("invited_at", { ascending: false });

  if (error) throw new Error(error.message);

  const enrollments: StudentProfileEnrollmentSummary[] = [];

  for (const row of data ?? []) {
    const enrollment = enrollmentRowToEnrollment(row as ProgramEnrollmentRow);
    const programRow = (row as { member_programs: MemberProgramRow | null }).member_programs;
    if (!programRow) continue;

    const program = memberProgramRowToProgram(programRow);
    enrollments.push({
      id: enrollment.id,
      programTitle: program.title,
      programSlug: program.slug,
      status: enrollment.status,
      amountPaid: enrollment.amountPaid,
      currency: enrollment.currency,
      enrolledAt: enrollment.invitedAt,
      accessEndsAt: enrollment.accessEndsAt,
    });
  }

  return { profile, enrollments };
}

export async function updateStudentSelf(
  userId: string,
  payload: StudentSelfUpdatePayload
): Promise<StudentProfile> {
  const supabase = createClient();
  const row: Record<string, unknown> = {};

  if (payload.fullName !== undefined) row.full_name = payload.fullName.trim();
  if (payload.locale !== undefined) row.locale = payload.locale;
  if (payload.phone !== undefined) row.phone = payload.phone?.trim() || null;

  const { data, error } = await supabase
    .from("student_profiles")
    .update(row)
    .eq("id", userId)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return studentProfileRowToProfile(data as StudentProfileRow);
}

async function loadStudentDashboardProgram(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  program: MemberProgram,
  enrollment: ProgramEnrollment,
  options?: { includeLessons?: boolean }
): Promise<StudentDashboardProgram> {
  const includeLessons = options?.includeLessons ?? true;
  const lessonsClient = includeLessons ? supabase : createAdminDbClient();
  const { data: lessonsData } = await lessonsClient
    .from("program_lessons")
    .select(includeLessons ? "*" : "id")
    .eq("program_id", program.id)
    .order("sort_order", { ascending: true });

  const lessonRows = (lessonsData ?? []) as ProgramLessonRow[];
  const lessonIds = lessonRows.map((row) => row.id);

  let progressData: import("./mappers").LessonProgressRow[] = [];
  if (lessonIds.length > 0) {
    const { data } = await supabase
      .from("lesson_progress")
      .select("*")
      .eq("student_id", userId)
      .in("lesson_id", lessonIds);
    progressData = (data as import("./mappers").LessonProgressRow[] | null) ?? [];
  }

  return buildStudentDashboardProgram(
    program,
    enrollment,
    lessonRows,
    progressData,
    options
  );
}

function buildStudentDashboardProgram(
  program: MemberProgram,
  enrollment: ProgramEnrollment,
  lessonRows: ProgramLessonRow[],
  progressData: import("./mappers").LessonProgressRow[],
  options?: { includeLessons?: boolean }
): StudentDashboardProgram {
  const includeLessons = options?.includeLessons ?? true;
  const lessonIds = lessonRows.map((row) => row.id);
  const lessons = includeLessons
    ? lessonRows.map(programLessonRowToLesson)
    : [];

  const progressMap = new Map(
    progressData.map((p) => [p.lesson_id, progressRowToProgress(p)])
  );

  const completedLessons = lessonIds.filter((id) =>
    progressMap.get(id)?.completedAt
  ).length;

  const { lesson: continueLesson, watchedAt: continueWatchingAt } = includeLessons
    ? resolveContinueLesson(lessons, progressMap, enrollment.lastAccessedAt)
    : { lesson: null, watchedAt: timestamp(enrollment.lastAccessedAt) };

  const totalLessons = lessonIds.length;

  return {
    program,
    enrollment,
    lessons,
    progressPercent: computeProgressPercent(completedLessons, totalLessons),
    completedLessons,
    totalLessons,
    continueLesson,
    continueWatchingAt,
  };
}

function timestamp(value: string | null | undefined): number {
  if (!value) return 0;
  const ms = new Date(value).getTime();
  return Number.isFinite(ms) ? ms : 0;
}

export const getStudentDashboard = cache(async function getStudentDashboard(
  userId: string
): Promise<StudentDashboardProgram[]> {
  return listStudentEnrollmentPrograms(userId, isEnrollmentActive);
});

/** Active program useful links only — no lessons/progress queries. */
export const getStudentUsefulLinks = cache(async function getStudentUsefulLinks(
  userId: string
): Promise<UsefulLink[]> {
  const supabase = createClient();
  const { data: enrollments, error } = await supabase
    .from("program_enrollments")
    .select("*, member_programs(*)")
    .eq("student_id", userId);

  if (error) throw new Error(error.message);

  const programs: StudentDashboardProgram[] = [];

  for (const row of enrollments ?? []) {
    const enrollment = enrollmentRowToEnrollment(row as ProgramEnrollmentRow);
    if (!isEnrollmentActive(enrollment)) continue;

    const programRow = (row as { member_programs: MemberProgramRow | null })
      .member_programs;
    if (!programRow) continue;

    const program = memberProgramRowToProgram(programRow);
    if (program.programType === "bonus") continue;
    if (!program.slug.trim()) continue;

    programs.push({
      program,
      enrollment,
      lessons: [],
      progressPercent: 0,
      completedLessons: 0,
      totalLessons: 0,
      continueLesson: null,
      continueWatchingAt: 0,
    });
  }

  programs.sort((a, b) => a.program.sortOrder - b.program.sortOrder);
  return collectUsefulLinks(programs);
});

export async function getStudentExpiredPrograms(
  userId: string
): Promise<StudentDashboardProgram[]> {
  return listStudentEnrollmentPrograms(userId, shouldShowInExpiredPrograms, {
    includeLessons: false,
  });
}

async function listStudentEnrollmentPrograms(
  userId: string,
  filterEnrollment: (
    enrollment: ProgramEnrollment
  ) => boolean,
  options?: { includeLessons?: boolean }
): Promise<StudentDashboardProgram[]> {
  const supabase = createClient();
  const includeLessons = options?.includeLessons ?? true;

  const { data: enrollments, error } = await supabase
    .from("program_enrollments")
    .select("*, member_programs(*)")
    .eq("student_id", userId);

  if (error) throw new Error(error.message);

  type ProgramEntry = {
    program: MemberProgram;
    enrollment: ProgramEnrollment;
  };

  const entries: ProgramEntry[] = [];

  for (const row of enrollments ?? []) {
    const enrollment = enrollmentRowToEnrollment(row as ProgramEnrollmentRow);
    if (!filterEnrollment(enrollment)) continue;

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
    if (program.programType === "bonus") continue;
    if (!program.slug.trim()) continue;

    entries.push({ program, enrollment });
  }

  if (entries.length === 0) return [];

  const programIds = entries.map((entry) => entry.program.id);
  const lessonsClient = includeLessons ? supabase : createAdminDbClient();
  const { data: lessonsData, error: lessonsError } = await lessonsClient
    .from("program_lessons")
    .select("*")
    .in("program_id", programIds)
    .order("sort_order", { ascending: true });

  if (lessonsError) throw new Error(lessonsError.message);

  const lessonRows = (lessonsData ?? []) as ProgramLessonRow[];
  const lessonsByProgram = new Map<string, ProgramLessonRow[]>();
  for (const lessonRow of lessonRows) {
    const bucket = lessonsByProgram.get(lessonRow.program_id);
    if (bucket) {
      bucket.push(lessonRow);
    } else {
      lessonsByProgram.set(lessonRow.program_id, [lessonRow]);
    }
  }

  const allLessonIds = lessonRows.map((row) => row.id);
  let progressData: import("./mappers").LessonProgressRow[] = [];
  if (allLessonIds.length > 0) {
    const { data, error: progressError } = await supabase
      .from("lesson_progress")
      .select("*")
      .eq("student_id", userId)
      .in("lesson_id", allLessonIds);
    if (progressError) throw new Error(progressError.message);
    progressData = (data as import("./mappers").LessonProgressRow[] | null) ?? [];
  }

  const progressByLesson = new Map(
    progressData.map((row) => [row.lesson_id, row])
  );

  const results = entries.map(({ program, enrollment }) => {
    const programLessonRows = lessonsByProgram.get(program.id) ?? [];
    const programProgress = programLessonRows
      .map((row) => progressByLesson.get(row.id))
      .filter((row): row is import("./mappers").LessonProgressRow => row != null);

    return buildStudentDashboardProgram(
      program,
      enrollment,
      programLessonRows,
      programProgress,
      options
    );
  });

  results.sort((a, b) => a.program.sortOrder - b.program.sortOrder);
  return results;
}

export async function getStudentEnrollmentForProgram(
  userId: string,
  programSlug: string
): Promise<{ program: MemberProgram; enrollment: ProgramEnrollment } | null> {
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

  return {
    program: memberProgramRowToProgram(programData as MemberProgramRow),
    enrollment: enrollmentRowToEnrollment(enrollmentRow as ProgramEnrollmentRow),
  };
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
  if (program.programType === "bonus") return null;
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

export async function touchLessonActivity(
  userId: string,
  lessonId: string
): Promise<void> {
  await upsertLessonProgress(userId, lessonId, {});
}

async function resolveLessonProgramContext(lessonId: string): Promise<{
  programId: string;
  programType: "main" | "bonus";
} | null> {
  const admin = createAdminDbClient();
  const { data: lessonRow, error: lessonError } = await admin
    .from("program_lessons")
    .select("program_id")
    .eq("id", lessonId)
    .maybeSingle();

  if (lessonError) throw new Error(lessonError.message);
  if (!lessonRow?.program_id) return null;

  const { data: programRow, error: programError } = await admin
    .from("member_programs")
    .select("program_type")
    .eq("id", lessonRow.program_id)
    .maybeSingle();

  if (programError) throw new Error(programError.message);
  if (!programRow) return null;

  return {
    programId: String(lessonRow.program_id),
    programType: programRow.program_type === "bonus" ? "bonus" : "main",
  };
}

export async function upsertLessonProgress(
  userId: string,
  lessonId: string,
  updates: { lastPositionSeconds?: number; completed?: boolean }
): Promise<LessonProgress> {
  const programContext = await resolveLessonProgramContext(lessonId);
  if (!programContext) throw new Error("Lesson not found");

  let supabase: ReturnType<typeof createClient>;
  if (programContext.programType === "bonus") {
    const hasAccess = await studentHasBonusProgramAccess(
      userId,
      programContext.programId
    );
    if (!hasAccess) throw new Error("Forbidden");
    supabase = createAdminDbClient();
  } else {
    supabase = createClient();
  }

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

export const getStudentEnrollmentCount = cache(async function getStudentEnrollmentCount(
  userId: string
): Promise<number> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("program_enrollments")
    .select("program_id, member_programs!inner(program_type)")
    .eq("student_id", userId)
    .eq("member_programs.program_type", "main");

  if (error) throw new Error(error.message);
  return data?.length ?? 0;
});

export async function getCompletedLessonIds(
  userId: string,
  lessonIds: string[]
): Promise<Set<string>> {
  if (lessonIds.length === 0) return new Set();

  const supabase = createClient();
  const { data, error } = await supabase
    .from("lesson_progress")
    .select("lesson_id")
    .eq("student_id", userId)
    .in("lesson_id", lessonIds)
    .not("completed_at", "is", null);

  if (error) throw new Error(error.message);
  return new Set((data ?? []).map((row) => row.lesson_id as string));
}

// ---------------------------------------------------------------------------
// Invite (service role)
// ---------------------------------------------------------------------------

type StudentAuthLinkType = "invite" | "recovery" | "magiclink";

function studentAuthCallbackUrl(nextPath: string): string {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "https://www.mxaiacademy.com";
  return `${siteUrl}/auth/callback?next=${encodeURIComponent(nextPath)}`;
}

async function generateStudentAuthLink(
  service: ReturnType<typeof createServiceClient>,
  options: {
    email: string;
    fullName: string;
    locale: "EN" | "FA";
    linkOrder: StudentAuthLinkType[];
  }
): Promise<{ inviteLink: string; userId: string }> {
  const setPasswordPath = accountSetPasswordPath("en");
  const learnRedirectPath = learnPath("en");
  const email = options.email.trim().toLowerCase();
  const fullName = options.fullName.trim();

  // generateLink only — do NOT use inviteUserByEmail (that sends a second Supabase email).
  for (const type of options.linkOrder) {
    const redirectTo =
      type === "magiclink"
        ? studentAuthCallbackUrl(learnRedirectPath)
        : studentAuthCallbackUrl(setPasswordPath);
    const { data, error } = await service.auth.admin.generateLink({
      type,
      email,
      options: {
        redirectTo,
        data: { full_name: fullName },
      },
    } as Parameters<typeof service.auth.admin.generateLink>[0]);
    if (!error && data?.properties?.action_link && data.user?.id) {
      return {
        inviteLink: data.properties.action_link,
        userId: data.user.id,
      };
    }
  }

  throw new Error("Could not create invite link");
}

export async function checkStudentInviteAdmin(
  email: string,
  programId: string
): Promise<StudentInviteCheck> {
  const service = createServiceClient();
  const normalizedEmail = email.trim().toLowerCase();
  const programData = await getProgramAdmin(programId);
  const programTitle = programData?.program.title ?? "Selected program";

  if (!normalizedEmail) {
    return { exists: false, duplicateKind: "none", programTitle };
  }

  const { data: profileData, error } = await service
    .from("student_profiles")
    .select("*")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!profileData) {
    return { exists: false, duplicateKind: "none", programTitle };
  }

  const student = await getStudentAdmin(profileData.id);
  if (!student) {
    return { exists: false, duplicateKind: "none", programTitle };
  }

  const existingEnrollment =
    student.enrollments.find((item) => item.programId === programId) ?? undefined;

  return {
    exists: true,
    duplicateKind: existingEnrollment ? "same_program" : "new_program",
    programTitle,
    student: student.profile,
    existingEnrollment,
    enrollments: student.enrollments,
  };
}

export async function inviteStudentAdmin(
  payload: InviteStudentPayload,
  invitedBy: string
): Promise<{ student: StudentProfile; enrollment: ProgramEnrollment; inviteLink: string }> {
  const duplicateCheck = await checkStudentInviteAdmin(payload.email, payload.programId);
  if (duplicateCheck.exists) {
    if (duplicateCheck.duplicateKind === "same_program") {
      throw new Error(
        "This student is already enrolled in this program. Use Resend invite instead."
      );
    }
    if (!payload.allowExisting) {
      throw new Error(
        "A student with this email already exists. Confirm adding them to this program."
      );
    }
  }

  const service = createServiceClient();
  const email = payload.email.trim().toLowerCase();
  const fullName = payload.fullName.trim();

  const { inviteLink, userId } = await generateStudentAuthLink(service, {
    email,
    fullName,
    locale: payload.locale === "FA" ? "FA" : "EN",
    linkOrder: ["invite", "recovery", "magiclink"],
  });

  const accessStartsAt =
    payload.accessStartsAt?.trim() || startOfTodayIso();
  const accessEndsAt = payload.accessEndsAt ?? null;

  const isExistingStudent =
    duplicateCheck.exists && duplicateCheck.duplicateKind === "new_program";

  let profileData: StudentProfileRow;

  if (isExistingStudent) {
    const updates: Record<string, unknown> = {};
    if (fullName) updates.full_name = fullName;
    if (payload.phone?.trim()) updates.phone = payload.phone.trim();
    if (payload.notes?.trim()) updates.notes = payload.notes.trim();

    if (Object.keys(updates).length > 0) {
      const { data, error } = await service
        .from("student_profiles")
        .update(updates)
        .eq("id", userId)
        .select("*")
        .single();
      if (error) throw new Error(error.message);
      profileData = data as StudentProfileRow;
    } else {
      const { data, error } = await service
        .from("student_profiles")
        .select("*")
        .eq("id", userId)
        .single();
      if (error) throw new Error(error.message);
      profileData = data as StudentProfileRow;
    }
  } else {
    const { data, error: profileError } = await service
      .from("student_profiles")
      .upsert(
        {
          id: userId,
          email,
          full_name: fullName,
          locale: payload.locale,
          phone: payload.phone?.trim() || null,
          notes: payload.notes?.trim() || null,
        },
        { onConflict: "id" }
      )
      .select("*")
      .single();

    if (profileError) throw new Error(profileError.message);
    profileData = data as StudentProfileRow;
  }

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
    student: studentProfileRowToProfile(profileData),
    enrollment: enrollmentRowToEnrollment(enrollmentData as ProgramEnrollmentRow),
    inviteLink,
  };
}

export async function resendStudentInviteAdmin(
  studentId: string,
  programId?: string | null
): Promise<{
  student: StudentProfile;
  enrollment: EnrollmentWithDetails;
  inviteLink: string;
}> {
  const student = await getStudentAdmin(studentId);
  if (!student) throw new Error("Student not found");

  const enrollment =
    (programId
      ? student.enrollments.find((item) => item.programId === programId)
      : student.enrollments[0]) ?? null;

  if (!enrollment?.program) {
    throw new Error("Student has no program enrollment to include in the invite email");
  }

  const service = createServiceClient();
  const { inviteLink } = await generateStudentAuthLink(service, {
    email: student.profile.email,
    fullName: student.profile.fullName,
    locale: student.profile.locale,
    linkOrder: ["recovery", "invite", "magiclink"],
  });

  return {
    student: student.profile,
    enrollment,
    inviteLink,
  };
}

/** Self-service forgot password — only for emails in `student_profiles`. */
export async function createStudentPasswordResetLink(
  email: string
): Promise<{ resetLink: string; profile: StudentProfile } | null> {
  const service = createServiceClient();
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) return null;

  const { data: profileData, error } = await service
    .from("student_profiles")
    .select("*")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!profileData) return null;

  const profile = studentProfileRowToProfile(profileData as StudentProfileRow);
  const { inviteLink: resetLink } = await generateStudentAuthLink(service, {
    email: normalizedEmail,
    fullName: profile.fullName,
    locale: profile.locale,
    linkOrder: ["recovery", "invite", "magiclink"],
  });

  return { resetLink, profile };
}

export async function deleteStudentAdmin(studentId: string): Promise<void> {
  const service = createServiceClient();
  const { data: profile, error: profileError } = await service
    .from("student_profiles")
    .select("id")
    .eq("id", studentId)
    .maybeSingle();

  if (profileError) throw new Error(profileError.message);
  if (!profile) throw new Error("Student not found");

  const { error } = await service.auth.admin.deleteUser(studentId);
  if (error) throw new Error(error.message);
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

export type StudentAnnouncementAudience =
  | { type: "all" }
  | { type: "student"; studentId: string }
  | { type: "programs"; programIds: string[] };

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

async function studentsFromProgramEnrollments(
  programIds: string[]
): Promise<StudentProfile[]> {
  if (programIds.length === 0) return [];

  const supabase = createClient();
  const { data, error } = await supabase
    .from("program_enrollments")
    .select("student_profiles(*)")
    .in("program_id", programIds);

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

async function enrichStudentProfileWithActivation(
  profile: StudentProfile
): Promise<StudentProfile> {
  const service = createServiceClient();
  const { data, error } = await service.auth.admin.getUserById(profile.id);
  if (error || !data.user) {
    return { ...profile, accountActivated: false, accountActivatedAt: null };
  }
  return { ...profile, ...resolveStudentAccountActivation(data.user) };
}

export async function listStudentsAdmin(): Promise<StudentProfile[]> {
  const students = await resolveStudentEmailRecipients({ type: "all" });
  return Promise.all(students.map((profile) => enrichStudentProfileWithActivation(profile)));
}

export async function resolveStudentEmailRecipients(
  audience: StudentEmailAudience
): Promise<StudentProfile[]> {
  if (audience.type === "student") {
    const student = await getStudentAdmin(audience.studentId);
    return student ? [student.profile] : [];
  }

  if (audience.type === "program") {
    return studentsFromProgramEnrollments([audience.programId]);
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("student_profiles")
    .select("*")
    .order("full_name", { ascending: true });

  if (error) throw new Error(error.message);
  return dedupeStudentsByEmail(
    (data as StudentProfileRow[]).map(studentProfileRowToProfile)
  );
}

export async function resolveAnnouncementRecipients(
  audience: StudentAnnouncementAudience
): Promise<StudentProfile[]> {
  if (audience.type === "student") {
    const student = await getStudentAdmin(audience.studentId);
    return student ? [student.profile] : [];
  }

  if (audience.type === "programs") {
    return studentsFromProgramEnrollments(audience.programIds);
  }

  return resolveStudentEmailRecipients({ type: "all" });
}

async function getStudentEnrolledProgramIds(studentId: string): Promise<string[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("program_enrollments")
    .select("program_id, status, access_starts_at, access_ends_at")
    .eq("student_id", studentId);

  if (error) throw new Error(error.message);
  return (data ?? [])
    .map((row) =>
      enrollmentRowToEnrollment(row as ProgramEnrollmentRow)
    )
    .filter(isEnrollmentActive)
    .map((enrollment) => enrollment.programId);
}

export function announcementMatchesStudent(
  announcement: StudentAnnouncement,
  studentId: string,
  enrolledProgramIds: string[],
  studentLocale: "EN" | "FA"
): boolean {
  if (announcement.audienceType === "student") {
    return announcement.studentId === studentId;
  }

  if (announcement.audienceType === "programs") {
    return announcement.programIds.some((programId) =>
      enrolledProgramIds.includes(programId)
    );
  }

  return announcement.locale === "ALL" || announcement.locale === studentLocale;
}

// ---------------------------------------------------------------------------
// Student announcements
// ---------------------------------------------------------------------------

interface StudentAnnouncementRow {
  id: string;
  title: string;
  body: string;
  locale: AnnouncementLocale;
  audience_type?: StudentAnnouncementAudienceType | null;
  student_id?: string | null;
  program_ids?: string[] | null;
  link_url?: string | null;
  link_label?: string | null;
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
    audienceType: row.audience_type ?? "all",
    studentId: row.student_id ?? null,
    programIds: row.program_ids ?? [],
    linkUrl: row.link_url ?? null,
    linkLabel: row.link_label?.trim() || null,
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
  const supabase = createAdminDbClient();
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
  const supabase = createAdminDbClient();
  const baseRow = {
    title: payload.title.trim(),
    body: payload.body.trim(),
    locale: payload.locale ?? "ALL",
    audience_type: payload.audienceType,
    student_id: payload.audienceType === "student" ? payload.studentId ?? null : null,
    program_ids:
      payload.audienceType === "programs" ? payload.programIds ?? [] : [],
    link_url: normalizeAnnouncementLink(payload.linkUrl),
    link_label: normalizeAnnouncementLink(payload.linkUrl)
      ? payload.linkLabel?.trim() || null
      : null,
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
    const announcement = announcementRowToAnnouncement(data as StudentAnnouncementRow);
    if (announcement.publishedAt) {
      void notifyStudentsForAnnouncement(announcement);
    }
    return announcement;
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
  const announcement = announcementRowToAnnouncement(data as StudentAnnouncementRow);
  if (announcement.publishedAt) {
    void notifyStudentsForAnnouncement(announcement);
  }
  return announcement;
}

export async function deleteAnnouncementAdmin(id: string): Promise<void> {
  const supabase = createAdminDbClient();
  const { error } = await supabase.from("student_announcements").delete().eq("id", id);
  if (error) {
    if (isMissingAnnouncementsTable(error)) throw new Error(ANNOUNCEMENTS_SETUP_HINT);
    throw new Error(error.message);
  }
}

export const listAnnouncementsForStudent = cache(async function listAnnouncementsForStudent(
  studentId: string,
  studentLocale: "EN" | "FA",
  options?: { includeDismissed?: boolean; limit?: number }
): Promise<StudentAnnouncementWithState[]> {
  const supabase = createClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("student_announcements")
    .select("*")
    .not("published_at", "is", null)
    .lte("published_at", now)
    .or(`expires_at.is.null,expires_at.gt."${now}"`)
    .order("published_at", { ascending: false })
    .limit(50);

  if (error) {
    if (isMissingAnnouncementsTable(error)) return [];
    throw new Error(error.message);
  }

  const enrolledProgramIds = await getStudentEnrolledProgramIds(studentId);
  const matched = (data as StudentAnnouncementRow[])
    .map(announcementRowToAnnouncement)
    .filter((announcement) =>
      announcementMatchesStudent(
        announcement,
        studentId,
        enrolledProgramIds,
        studentLocale
      )
    );

  const states = await getAnnouncementStatesForStudent(
    studentId,
    matched.map((item) => item.id)
  );
  const withState = mergeAnnouncementsWithState(matched, states);
  const visible = options?.includeDismissed
    ? withState
    : withState.filter((item) => !item.isDismissed);

  if (options?.limit != null) {
    return visible.slice(0, options.limit);
  }
  return visible;
});
