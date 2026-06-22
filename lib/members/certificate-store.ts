import { isEnrollmentActive } from "@/lib/members/access";
import {
  enrollmentRowToEnrollment,
  memberProgramRowToProgram,
  programLessonRowToLesson,
  studentProfileRowToProfile,
  type MemberProgramRow,
  type ProgramEnrollmentRow,
  type ProgramLessonRow,
  type StudentProfileRow,
} from "@/lib/members/mappers";
import type { MemberProgram, ProgramCertificate } from "@/lib/members/types";
import { createAdminDbClient } from "@/lib/supabase/admin-client";
import { createClient } from "@/lib/supabase/server";

export interface ProgramCertificateRow {
  id: string;
  certificate_number: string;
  student_id: string;
  program_id: string;
  enrollment_id: string | null;
  student_name: string;
  student_number: string;
  program_title_en: string;
  program_title_fa: string;
  total_hours: number | string;
  issued_at: string;
  issued_by: string | null;
  revoked_at: string | null;
  created_at: string;
}

function parseHours(value: number | string): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function certificateRowToCertificate(row: ProgramCertificateRow): ProgramCertificate {
  return {
    id: row.id,
    certificateNumber: row.certificate_number,
    studentId: row.student_id,
    programId: row.program_id,
    enrollmentId: row.enrollment_id,
    studentName: row.student_name,
    studentNumber: row.student_number,
    programTitleEn: row.program_title_en,
    programTitleFa: row.program_title_fa,
    totalHours: parseHours(row.total_hours),
    issuedAt: row.issued_at,
    issuedBy: row.issued_by,
    revokedAt: row.revoked_at,
    createdAt: row.created_at,
  };
}

function resolveCertificateTitles(program: MemberProgram): {
  programTitleEn: string;
  programTitleFa: string;
} {
  const fallbackEn = program.titleEn.trim() || program.title.trim();
  const fallbackFa = program.titleFa.trim() || program.title.trim();
  return {
    programTitleEn: (program.certificateTitleEn ?? "").trim() || fallbackEn,
    programTitleFa: (program.certificateTitleFa ?? "").trim() || fallbackFa,
  };
}

async function loadProgramLessons(programId: string) {
  const supabase = createAdminDbClient();
  const { data, error } = await supabase
    .from("program_lessons")
    .select("*")
    .eq("program_id", programId)
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);
  return (data as ProgramLessonRow[]).map(programLessonRowToLesson);
}

async function computeProgramHours(
  program: MemberProgram,
  publishedLessons: ReturnType<typeof programLessonRowToLesson>[]
): Promise<number> {
  if (program.certificateHours != null && program.certificateHours > 0) {
    return program.certificateHours;
  }
  const minutes = publishedLessons.reduce(
    (sum, lesson) => sum + (lesson.durationMinutes ?? 0),
    0
  );
  return Math.round((minutes / 60) * 10) / 10;
}

async function loadActiveCertificate(
  studentId: string,
  programId: string
): Promise<ProgramCertificate | null> {
  const supabase = createAdminDbClient();
  const { data, error } = await supabase
    .from("program_certificates")
    .select("*")
    .eq("student_id", studentId)
    .eq("program_id", programId)
    .is("revoked_at", null)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return certificateRowToCertificate(data as ProgramCertificateRow);
}

async function loadProgramRow(programId: string): Promise<MemberProgram | null> {
  const supabase = createAdminDbClient();
  const { data, error } = await supabase
    .from("member_programs")
    .select("*")
    .eq("id", programId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return memberProgramRowToProgram(data as MemberProgramRow);
}

async function loadEnrollment(studentId: string, programId: string) {
  const supabase = createAdminDbClient();
  const { data, error } = await supabase
    .from("program_enrollments")
    .select("*")
    .eq("student_id", studentId)
    .eq("program_id", programId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

async function loadCompletedLessonIds(studentId: string, lessonIds: string[]) {
  if (lessonIds.length === 0) return new Set<string>();

  const supabase = createAdminDbClient();
  const { data, error } = await supabase
    .from("lesson_progress")
    .select("lesson_id, completed_at")
    .eq("student_id", studentId)
    .in("lesson_id", lessonIds);

  if (error) throw new Error(error.message);

  return new Set(
    (data ?? [])
      .filter((row) => row.completed_at)
      .map((row) => String(row.lesson_id))
  );
}

export async function checkCertificateEligibility(
  studentId: string,
  programId: string
): Promise<{ eligible: boolean; reason?: string }> {
  const program = await loadProgramRow(programId);
  if (!program) return { eligible: false, reason: "Program not found" };
  if (!program.certificateEnabled) {
    return { eligible: false, reason: "Certificates disabled for this program" };
  }

  const enrollmentRow = await loadEnrollment(studentId, programId);
  if (!enrollmentRow) {
    return { eligible: false, reason: "Student is not enrolled" };
  }

  const enrollment = enrollmentRowToEnrollment(enrollmentRow as ProgramEnrollmentRow);
  if (!isEnrollmentActive(enrollment)) {
    return { eligible: false, reason: "Enrollment is not active" };
  }

  const lessons = await loadProgramLessons(programId);
  if (lessons.length === 0) {
    return { eligible: false, reason: "No lessons in program" };
  }

  const completedIds = await loadCompletedLessonIds(
    studentId,
    lessons.map((lesson) => lesson.id)
  );
  const allComplete = lessons.every((lesson) => completedIds.has(lesson.id));
  if (!allComplete) {
    return { eligible: false, reason: "Not all lessons completed" };
  }

  return { eligible: true };
}

async function insertCertificate(
  studentId: string,
  programId: string,
  issuedBy: string | null
): Promise<ProgramCertificate> {
  const existing = await loadActiveCertificate(studentId, programId);
  if (existing) return existing;

  const program = await loadProgramRow(programId);
  if (!program) throw new Error("Program not found");
  if (!program.certificateEnabled) {
    throw new Error("Certificates are not enabled for this program");
  }

  const supabase = createAdminDbClient();
  const { data: profileData, error: profileError } = await supabase
    .from("student_profiles")
    .select("*")
    .eq("id", studentId)
    .single();

  if (profileError) throw new Error(profileError.message);
  const profile = studentProfileRowToProfile(profileData as StudentProfileRow);
  if (!profile.studentNumber?.trim()) {
    throw new Error("Student ID is missing");
  }

  const enrollmentRow = await loadEnrollment(studentId, programId);
  if (!enrollmentRow) throw new Error("Enrollment not found");

  const lessons = await loadProgramLessons(programId);
  const totalHours = await computeProgramHours(program, lessons);
  const titles = resolveCertificateTitles(program);

  const { data, error } = await supabase
    .from("program_certificates")
    .insert({
      student_id: studentId,
      program_id: programId,
      enrollment_id: enrollmentRow.id,
      student_name: profile.fullName.trim() || profile.email,
      student_number: profile.studentNumber,
      program_title_en: titles.programTitleEn,
      program_title_fa: titles.programTitleFa,
      total_hours: totalHours,
      issued_by: issuedBy,
    })
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      const retry = await loadActiveCertificate(studentId, programId);
      if (retry) return retry;
    }
    throw new Error(error.message);
  }

  return certificateRowToCertificate(data as ProgramCertificateRow);
}

export async function issueCertificateIfEligible(
  studentId: string,
  programId: string,
  issuedBy: string | null = null
): Promise<ProgramCertificate | null> {
  try {
    const { eligible } = await checkCertificateEligibility(studentId, programId);
    if (!eligible) return null;
    return await insertCertificate(studentId, programId, issuedBy);
  } catch (error) {
    console.error("[certificate] auto-issue failed", error);
    return null;
  }
}

export async function issueCertificateAdmin(
  studentId: string,
  programId: string,
  issuedBy: string
): Promise<ProgramCertificate> {
  const program = await loadProgramRow(programId);
  if (!program) throw new Error("Program not found");
  if (!program.certificateEnabled) {
    throw new Error("Enable certificates on this program first");
  }

  const enrollmentRow = await loadEnrollment(studentId, programId);
  if (!enrollmentRow) throw new Error("Student is not enrolled in this program");

  return insertCertificate(studentId, programId, issuedBy);
}

export async function revokeCertificateAdmin(certificateId: string): Promise<void> {
  const supabase = createAdminDbClient();
  const { error } = await supabase
    .from("program_certificates")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", certificateId)
    .is("revoked_at", null);

  if (error) throw new Error(error.message);
}

export async function getStudentCertificateForProgram(
  studentId: string,
  programId: string
): Promise<ProgramCertificate | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("program_certificates")
    .select("*")
    .eq("student_id", studentId)
    .eq("program_id", programId)
    .is("revoked_at", null)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return certificateRowToCertificate(data as ProgramCertificateRow);
}

export async function getCertificateByNumber(
  certificateNumber: string
): Promise<ProgramCertificate | null> {
  const supabase = createAdminDbClient();
  const { data, error } = await supabase
    .from("program_certificates")
    .select("*")
    .eq("certificate_number", certificateNumber.trim())
    .is("revoked_at", null)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return certificateRowToCertificate(data as ProgramCertificateRow);
}

export async function listCertificatesForStudent(
  studentId: string
): Promise<ProgramCertificate[]> {
  const supabase = createAdminDbClient();
  const { data, error } = await supabase
    .from("program_certificates")
    .select("*")
    .eq("student_id", studentId)
    .is("revoked_at", null)
    .order("issued_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data as ProgramCertificateRow[]).map(certificateRowToCertificate);
}

export interface StudentCertificateListItem {
  certificate: ProgramCertificate;
  programSlug: string;
  programTitle: string;
}

export async function listStudentCertificatesWithPrograms(
  studentId: string
): Promise<StudentCertificateListItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("program_certificates")
    .select("*, member_programs(slug, title)")
    .eq("student_id", studentId)
    .is("revoked_at", null)
    .order("issued_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? [])
    .map((row) => {
      const program = row.member_programs as { slug: string; title: string } | null;
      if (!program?.slug?.trim()) return null;
      const { member_programs: _omit, ...certRow } = row as ProgramCertificateRow & {
        member_programs: { slug: string; title: string } | null;
      };
      return {
        certificate: certificateRowToCertificate(certRow as ProgramCertificateRow),
        programSlug: program.slug,
        programTitle: program.title,
      };
    })
    .filter((item): item is StudentCertificateListItem => item !== null);
}

export async function maybeIssueCertificateForLesson(
  studentId: string,
  lessonId: string
): Promise<ProgramCertificate | null> {
  const flow = await completeLessonCertificateFlow(studentId, lessonId);
  return flow.certificate;
}

export async function completeLessonCertificateFlow(
  studentId: string,
  lessonId: string
): Promise<{
  certificate: ProgramCertificate | null;
  programCompleted: boolean;
  certificateEnabled: boolean;
}> {
  const supabase = createAdminDbClient();
  const { data, error } = await supabase
    .from("program_lessons")
    .select("program_id")
    .eq("id", lessonId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data?.program_id) {
    return { certificate: null, programCompleted: false, certificateEnabled: false };
  }

  const programId = String(data.program_id);
  const program = await loadProgramRow(programId);
  const lessons = await loadProgramLessons(programId);
  const completedIds = await loadCompletedLessonIds(
    studentId,
    lessons.map((lesson) => lesson.id)
  );
  const programCompleted =
    lessons.length > 0 && lessons.every((lesson) => completedIds.has(lesson.id));
  const certificateEnabled = Boolean(program?.certificateEnabled);

  let certificate: ProgramCertificate | null = null;
  if (programCompleted && certificateEnabled) {
    certificate = await issueCertificateIfEligible(studentId, programId);
  }

  return { certificate, programCompleted, certificateEnabled };
}

export async function syncCertificatesForCompletedPrograms(
  studentId: string,
  programs: Array<{
    programId: string;
    certificateEnabled: boolean;
    progressPercent: number;
  }>
): Promise<ProgramCertificate[]> {
  const issued: ProgramCertificate[] = [];

  for (const item of programs) {
    if (!item.certificateEnabled || item.progressPercent < 100) continue;
    const certificate = await issueCertificateIfEligible(studentId, item.programId);
    if (certificate) issued.push(certificate);
  }

  return issued;
}

export async function certificatesByProgramIdForStudent(
  studentId: string
): Promise<Record<string, ProgramCertificate>> {
  const certificates = await listCertificatesForStudent(studentId);
  const map: Record<string, ProgramCertificate> = {};
  for (const cert of certificates) {
    map[cert.programId] = cert;
  }
  return map;
}
