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
import type {
  EnrollmentWithDetails,
  InviteStudentPayload,
  LessonProgress,
  MemberProgram,
  MemberProgramPayload,
  ProgramEnrollment,
  ProgramLesson,
  ProgramLessonPayload,
  StudentDashboardProgram,
  StudentProfile,
} from "./types";

function normalizeSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
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
  const slug = normalizeSlug(payload.slug || payload.title);

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

export async function listEnrollmentsAdmin(): Promise<EnrollmentWithDetails[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("program_enrollments")
    .select(
      "*, student_profiles(*), member_programs(*)"
    )
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  const enrollments = (data ?? []) as Array<
    ProgramEnrollmentRow & {
      student_profiles: StudentProfileRow | null;
      member_programs: MemberProgramRow | null;
    }
  >;

  const results: EnrollmentWithDetails[] = [];

  for (const row of enrollments) {
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
        .eq("program_id", program.id)
        .not("published_at", "is", null);
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

    results.push({
      ...enrollment,
      student,
      program,
      completedLessons,
      totalLessons,
      progressPercent: computeProgressPercent(completedLessons, totalLessons),
    });
  }

  return results;
}

export async function updateEnrollmentAdmin(
  enrollmentId: string,
  updates: Partial<{
    status: ProgramEnrollment["status"];
    accessStartsAt: string;
    accessEndsAt: string | null;
  }>
): Promise<ProgramEnrollment> {
  const supabase = createClient();
  const row: Record<string, unknown> = {};
  if (updates.status) row.status = updates.status;
  if (updates.accessStartsAt) row.access_starts_at = updates.accessStartsAt;
  if (updates.accessEndsAt !== undefined) row.access_ends_at = updates.accessEndsAt;

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

    const programRow = (row as { member_programs: MemberProgramRow | null })
      .member_programs;
    if (!programRow || programRow.status !== "published") continue;

    const program = memberProgramRowToProgram(programRow);

    const { data: lessonsData } = await supabase
      .from("program_lessons")
      .select("*")
      .eq("program_id", program.id)
      .not("published_at", "is", null)
      .order("sort_order", { ascending: true });

    const lessons = (lessonsData as ProgramLessonRow[] ?? []).map(
      programLessonRowToLesson
    );

    const { data: progressData } = await supabase
      .from("lesson_progress")
      .select("*")
      .eq("student_id", userId)
      .in(
        "lesson_id",
        lessons.map((l) => l.id)
      );

    const progressMap = new Map(
      (progressData as import("./mappers").LessonProgressRow[] ?? []).map((p) => [
        p.lesson_id,
        progressRowToProgress(p),
      ])
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

    results.push({
      program,
      enrollment,
      lessons,
      progressPercent: computeProgressPercent(completedLessons, lessons.length),
      completedLessons,
      totalLessons: lessons.length,
      continueLesson,
    });
  }

  results.sort((a, b) => a.program.sortOrder - b.program.sortOrder);
  return results;
}

export async function getStudentProgram(
  userId: string,
  programSlug: string
): Promise<StudentDashboardProgram | null> {
  const dashboard = await getStudentDashboard(userId);
  return dashboard.find((d) => d.program.slug === programSlug) ?? null;
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

  const { data: profileData, error: profileError } = await service
    .from("student_profiles")
    .upsert(
      {
        id: userId,
        email,
        full_name: payload.fullName.trim(),
        locale: payload.locale,
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
        status: "invited",
        access_starts_at: payload.accessStartsAt,
        access_ends_at: payload.accessEndsAt ?? null,
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
