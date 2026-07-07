import { createAdminDbClient } from "@/lib/supabase/admin-client";
import { createClient } from "@/lib/supabase/server";
import { computeProgressPercent } from "./access";
import {
  bonusLinkRowToLink,
  memberProgramRowToProgram,
  programLessonRowToLesson,
  progressRowToProgress,
  type MemberProgramRow,
  type ProgramBonusLinkRow,
  type ProgramLessonRow,
} from "./mappers";
import type {
  LessonProgress,
  MemberProgram,
  ProgramBonusLink,
  ProgramBonusLinkPayload,
  ProgramLesson,
  StudentBonusProgramView,
} from "./types";

interface BonusAccessResolution {
  hasAccess: boolean;
  /** null when access is unlimited */
  accessEndsAt: string | null;
}

async function loadStudentMainProgramIds(
  userId: string
): Promise<Set<string>> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("program_enrollments")
    .select("program_id")
    .eq("student_id", userId);

  if (error) throw new Error(error.message);
  return new Set((data ?? []).map((row) => String(row.program_id)));
}

async function resolveStudentBonusAccess(
  userId: string,
  bonusProgramId: string
): Promise<BonusAccessResolution> {
  const enrolledIds = await loadStudentMainProgramIds(userId);
  if (enrolledIds.size === 0) {
    return { hasAccess: false, accessEndsAt: null };
  }

  const admin = createAdminDbClient();
  const { data: links, error: linksError } = await admin
    .from("program_bonus_links")
    .select("main_program_id, access_ends_at")
    .eq("bonus_program_id", bonusProgramId);

  if (linksError) throw new Error(linksError.message);

  const now = Date.now();
  const qualifying = (links ?? []).filter((link) => {
    if (!enrolledIds.has(String(link.main_program_id))) return false;
    if (!link.access_ends_at) return true;
    return new Date(link.access_ends_at).getTime() >= now;
  });

  if (qualifying.length === 0) {
    return { hasAccess: false, accessEndsAt: null };
  }

  if (qualifying.some((link) => !link.access_ends_at)) {
    return { hasAccess: true, accessEndsAt: null };
  }

  const maxEnd = qualifying.reduce((max, link) => {
    const ts = new Date(String(link.access_ends_at)).getTime();
    return ts > max ? ts : max;
  }, 0);

  return { hasAccess: true, accessEndsAt: new Date(maxEnd).toISOString() };
}

export async function studentHasBonusProgramAccess(
  userId: string,
  bonusProgramId: string
): Promise<boolean> {
  const access = await resolveStudentBonusAccess(userId, bonusProgramId);
  return access.hasAccess;
}

async function loadStudentBonusProgramView(
  userId: string,
  program: MemberProgram
): Promise<StudentBonusProgramView | null> {
  if (program.programType !== "bonus" || program.status !== "published") {
    return null;
  }

  const access = await resolveStudentBonusAccess(userId, program.id);
  if (!access.hasAccess) return null;

  const admin = createAdminDbClient();
  const { data: lessonsData, error: lessonsError } = await admin
    .from("program_lessons")
    .select("*")
    .eq("program_id", program.id)
    .order("sort_order", { ascending: true });

  if (lessonsError) throw new Error(lessonsError.message);

  const lessons = (lessonsData as ProgramLessonRow[]).map(programLessonRowToLesson);
  const publishedLessons = lessons.filter((lesson) => lesson.publishedAt);
  const lessonIds = publishedLessons.map((lesson) => lesson.id);

  let completedLessons = 0;
  if (lessonIds.length > 0) {
    const supabase = createClient();
    const { data: progressData, error: progressError } = await supabase
      .from("lesson_progress")
      .select("lesson_id")
      .eq("student_id", userId)
      .in("lesson_id", lessonIds)
      .not("completed_at", "is", null);

    if (progressError) throw new Error(progressError.message);
    completedLessons = progressData?.length ?? 0;
  }

  const totalLessons = publishedLessons.length;

  return {
    program,
    lessons: publishedLessons,
    completedLessons,
    totalLessons,
    progressPercent: computeProgressPercent(completedLessons, totalLessons),
    accessEndsAt: access.accessEndsAt,
  };
}

export async function listBonusLinksAdmin(bonusProgramId: string): Promise<ProgramBonusLink[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("program_bonus_links")
    .select("*")
    .eq("bonus_program_id", bonusProgramId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data as ProgramBonusLinkRow[]).map(bonusLinkRowToLink);
}

export async function saveBonusLinksAdmin(
  bonusProgramId: string,
  links: ProgramBonusLinkPayload[]
): Promise<ProgramBonusLink[]> {
  const supabase = createAdminDbClient();

  const { data: bonusProgram, error: bonusError } = await supabase
    .from("member_programs")
    .select("program_type")
    .eq("id", bonusProgramId)
    .maybeSingle();

  if (bonusError) throw new Error(bonusError.message);
  if (!bonusProgram || bonusProgram.program_type !== "bonus") {
    throw new Error("Bonus program not found.");
  }

  const normalized = links
    .map((link) => ({
      mainProgramId: link.mainProgramId.trim(),
      accessEndsAt: link.accessEndsAt,
    }))
    .filter((link) => link.mainProgramId);

  const uniqueMainIds = new Set(normalized.map((link) => link.mainProgramId));
  if (uniqueMainIds.size !== normalized.length) {
    throw new Error("Each main program can only be linked once.");
  }

  if (normalized.length > 0) {
    const { data: mainPrograms, error: mainError } = await supabase
      .from("member_programs")
      .select("id")
      .in("id", Array.from(uniqueMainIds))
      .eq("program_type", "main");

    if (mainError) throw new Error(mainError.message);
    if ((mainPrograms ?? []).length !== uniqueMainIds.size) {
      throw new Error("One or more selected main programs are invalid.");
    }
  }

  const { error: deleteError } = await supabase
    .from("program_bonus_links")
    .delete()
    .eq("bonus_program_id", bonusProgramId);

  if (deleteError) throw new Error(deleteError.message);

  if (normalized.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("program_bonus_links")
    .insert(
      normalized.map((link) => ({
        bonus_program_id: bonusProgramId,
        main_program_id: link.mainProgramId,
        access_ends_at: link.accessEndsAt,
      }))
    )
    .select("*");

  if (error) throw new Error(error.message);
  return (data as ProgramBonusLinkRow[]).map(bonusLinkRowToLink);
}

export async function getStudentBonusPrograms(
  userId: string
): Promise<StudentBonusProgramView[]> {
  const enrolledIds = await loadStudentMainProgramIds(userId);
  if (enrolledIds.size === 0) return [];

  const admin = createAdminDbClient();
  const { data: links, error: linksError } = await admin
    .from("program_bonus_links")
    .select("bonus_program_id, main_program_id, access_ends_at")
    .in("main_program_id", Array.from(enrolledIds));

  if (linksError) throw new Error(linksError.message);

  const now = Date.now();
  const accessibleBonusIds = new Set<string>();

  for (const link of links ?? []) {
    if (link.access_ends_at && new Date(link.access_ends_at).getTime() < now) {
      continue;
    }
    accessibleBonusIds.add(String(link.bonus_program_id));
  }

  if (accessibleBonusIds.size === 0) return [];

  const { data: programRows, error: programsError } = await admin
    .from("member_programs")
    .select("*")
    .in("id", Array.from(accessibleBonusIds))
    .eq("program_type", "bonus")
    .eq("status", "published")
    .order("sort_order", { ascending: true });

  if (programsError) throw new Error(programsError.message);

  const views = await Promise.all(
    (programRows ?? []).map(async (row) => {
      const program = memberProgramRowToProgram(row as MemberProgramRow);
      return loadStudentBonusProgramView(userId, program);
    })
  );

  return views.filter((view): view is StudentBonusProgramView => view !== null);
}

export async function getStudentBonusProgram(
  userId: string,
  programSlug: string
): Promise<StudentBonusProgramView | null> {
  const slug = programSlug.trim().toLowerCase();
  if (!slug) return null;

  const admin = createAdminDbClient();
  const { data: programData, error: programError } = await admin
    .from("member_programs")
    .select("*")
    .eq("slug", slug)
    .eq("program_type", "bonus")
    .eq("status", "published")
    .maybeSingle();

  if (programError) throw new Error(programError.message);
  if (!programData) return null;

  const program = memberProgramRowToProgram(programData as MemberProgramRow);
  return loadStudentBonusProgramView(userId, program);
}

export async function getStudentBonusLesson(
  userId: string,
  programSlug: string,
  lessonId: string
): Promise<{
  program: MemberProgram;
  lesson: ProgramLesson;
  lessons: ProgramLesson[];
  progress: LessonProgress | null;
  accessEndsAt: string | null;
} | null> {
  const programData = await getStudentBonusProgram(userId, programSlug);
  if (!programData) return null;

  const lesson = programData.lessons.find((item) => item.id === lessonId);
  if (!lesson) return null;

  const supabase = createClient();
  const { data: progressData } = await supabase
    .from("lesson_progress")
    .select("*")
    .eq("student_id", userId)
    .eq("lesson_id", lessonId)
    .maybeSingle();

  return {
    program: programData.program,
    lesson,
    lessons: programData.lessons,
    progress: progressData
      ? progressRowToProgress(progressData as import("./mappers").LessonProgressRow)
      : null,
    accessEndsAt: programData.accessEndsAt,
  };
}
