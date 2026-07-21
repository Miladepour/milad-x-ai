import { isEnrollmentActive } from "@/lib/members/access";
import { sendCertificateIssuedEmail } from "@/lib/email/resend";
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
import type {
  BulkIssueCertificatesPreview,
  BulkIssueCertificatesResult,
  BulkIssueCertificateAlreadyIssued,
  BulkIssueCertificateStudent,
  CertificateAdminListItem,
  CertificateListFilters,
  CertificateListResult,
  CertificateListStatusFilter,
  MemberProgram,
  ProgramCertificate,
  StudentProfile,
} from "@/lib/members/types";
import { createAdminDbClient } from "@/lib/supabase/admin-client";
import { createClient } from "@/lib/supabase/server";

export const CERTIFICATES_PAGE_SIZE = 20;

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
): Promise<{ certificate: ProgramCertificate; created: boolean }> {
  const existing = await loadActiveCertificate(studentId, programId);
  if (existing) return { certificate: existing, created: false };

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
      if (retry) return { certificate: retry, created: false };
    }
    throw new Error(error.message);
  }

  return {
    certificate: certificateRowToCertificate(data as ProgramCertificateRow),
    created: true,
  };
}

async function loadStudentProfile(studentId: string): Promise<StudentProfile | null> {
  const supabase = createAdminDbClient();
  const { data, error } = await supabase
    .from("student_profiles")
    .select("*")
    .eq("id", studentId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return studentProfileRowToProfile(data as StudentProfileRow);
}

async function sendCertificateIssuedEmailIfPossible(
  studentId: string,
  program: MemberProgram,
  certificate: ProgramCertificate
): Promise<void> {
  try {
    const profile = await loadStudentProfile(studentId);
    if (!profile?.email?.trim()) return;

    await sendCertificateIssuedEmail({
      to: profile.email,
      fullName: profile.fullName,
      programTitle:
        certificate.programTitleEn?.trim() ||
        certificate.programTitleFa?.trim() ||
        program.titleEn.trim() ||
        program.titleFa.trim() ||
        program.title,
      programSlug: program.slug,
      locale: profile.locale,
    });
  } catch (error) {
    console.error("[certificate] email send failed", error);
  }
}

export async function issueCertificateIfEligible(
  studentId: string,
  programId: string,
  issuedBy: string | null = null
): Promise<ProgramCertificate | null> {
  try {
    const { eligible } = await checkCertificateEligibility(studentId, programId);
    if (!eligible) return null;
    const program = await loadProgramRow(programId);
    if (!program) return null;
    const { certificate, created } = await insertCertificate(studentId, programId, issuedBy);
    if (created) {
      await sendCertificateIssuedEmailIfPossible(studentId, program, certificate);
    }
    return certificate;
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

  const { certificate, created } = await insertCertificate(studentId, programId, issuedBy);
  if (created) {
    await sendCertificateIssuedEmailIfPossible(studentId, program, certificate);
  }
  return certificate;
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

export async function updateCertificateAdmin(
  certificateId: string,
  payload: { studentName: string }
): Promise<ProgramCertificate> {
  const studentName = payload.studentName.trim().replace(/\s+/g, " ");
  if (studentName.length < 2) {
    throw new Error("Certificate name must be at least 2 characters.");
  }
  if (studentName.length > 120) {
    throw new Error("Certificate name is too long.");
  }

  const supabase = createAdminDbClient();
  const { data, error } = await supabase
    .from("program_certificates")
    .update({ student_name: studentName })
    .eq("id", certificateId)
    .is("revoked_at", null)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Certificate not found or already revoked.");
  return certificateRowToCertificate(data as ProgramCertificateRow);
}

export async function studentHasActiveCertificates(studentId: string): Promise<boolean> {
  const supabase = createAdminDbClient();
  const { count, error } = await supabase
    .from("program_certificates")
    .select("id", { count: "exact", head: true })
    .eq("student_id", studentId)
    .is("revoked_at", null);

  if (error) throw new Error(error.message);
  return (count ?? 0) > 0;
}

function escapeIlike(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

function buildCertificateListResult(
  items: CertificateAdminListItem[],
  total: number,
  page: number,
  pageSize: number
): CertificateListResult {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return {
    items,
    total,
    page,
    pageSize,
    totalPages,
  };
}

export async function listCertificatesAdmin(
  filters: CertificateListFilters = {}
): Promise<CertificateListResult> {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = CERTIFICATES_PAGE_SIZE;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const search = filters.search?.trim() ?? "";
  const status: CertificateListStatusFilter = filters.status ?? "active";

  const supabase = createAdminDbClient();
  let query = supabase
    .from("program_certificates")
    .select(
      "*, student_profiles!inner(email), member_programs(slug, title)",
      { count: "exact" }
    )
    .order("issued_at", { ascending: false });

  if (status === "active") {
    query = query.is("revoked_at", null);
  } else if (status === "revoked") {
    query = query.not("revoked_at", "is", null);
  }

  if (search) {
    const term = escapeIlike(search);
    if (search.includes("@")) {
      query = query.ilike("student_profiles.email", `%${term}%`);
    } else {
      query = query.or(
        [
          `student_name.ilike.%${term}%`,
          `certificate_number.ilike.%${term}%`,
          `student_number.ilike.%${term}%`,
          `program_title_en.ilike.%${term}%`,
          `program_title_fa.ilike.%${term}%`,
        ].join(",")
      );
    }
  }

  const { data, error, count } = await query.range(from, to);
  if (error) throw new Error(error.message);

  const items: CertificateAdminListItem[] = (data ?? []).map((row) => {
    const profile = row.student_profiles as { email: string } | null;
    const program = row.member_programs as { slug: string | null; title: string } | null;
    const {
      student_profiles: _profile,
      member_programs: _program,
      ...certRow
    } = row as ProgramCertificateRow & {
      student_profiles: { email: string } | null;
      member_programs: { slug: string | null; title: string } | null;
    };
    const certificate = certificateRowToCertificate(certRow as ProgramCertificateRow);
    return {
      certificate,
      studentEmail: profile?.email?.trim() || "",
      programSlug: program?.slug?.trim() || null,
      programTitle:
        program?.title?.trim() ||
        certificate.programTitleEn ||
        certificate.programTitleFa ||
        "Program",
    };
  });

  return buildCertificateListResult(items, count ?? 0, page, pageSize);
}

type BulkEnrollmentProfile = {
  id: string;
  email: string;
  full_name: string;
  student_number: string;
};

type BulkEnrollmentRow = {
  student_id: string;
  student_profiles: BulkEnrollmentProfile | BulkEnrollmentProfile[] | null;
};

function resolveEnrollmentProfile(
  profile: BulkEnrollmentRow["student_profiles"]
): BulkEnrollmentProfile | null {
  if (!profile) return null;
  return Array.isArray(profile) ? profile[0] ?? null : profile;
}

function mapEnrollmentToStudent(row: BulkEnrollmentRow): BulkIssueCertificateStudent | null {
  const profile = resolveEnrollmentProfile(row.student_profiles);
  if (!profile?.id) return null;
  return {
    studentId: profile.id,
    studentName: profile.full_name?.trim() || profile.email,
    email: profile.email,
    studentNumber: profile.student_number?.trim() || "",
  };
}

export async function previewBulkIssueCertificatesAdmin(
  programId: string
): Promise<BulkIssueCertificatesPreview> {
  const program = await loadProgramRow(programId);
  if (!program) throw new Error("Program not found");

  const supabase = createAdminDbClient();
  const { data: enrollmentRows, error: enrollmentError } = await supabase
    .from("program_enrollments")
    .select("student_id, student_profiles(id, email, full_name, student_number)")
    .eq("program_id", programId);

  if (enrollmentError) throw new Error(enrollmentError.message);

  const { data: certificateRows, error: certificateError } = await supabase
    .from("program_certificates")
    .select("student_id, certificate_number")
    .eq("program_id", programId)
    .is("revoked_at", null);

  if (certificateError) throw new Error(certificateError.message);

  const certByStudentId = new Map(
    (certificateRows ?? []).map((row) => [
      String(row.student_id),
      String(row.certificate_number),
    ])
  );

  const pendingStudents: BulkIssueCertificateStudent[] = [];
  const alreadyIssuedStudents: BulkIssueCertificateAlreadyIssued[] = [];
  const seenStudentIds = new Set<string>();

  for (const row of (enrollmentRows ?? []) as unknown as BulkEnrollmentRow[]) {
    const student = mapEnrollmentToStudent(row);
    if (!student || seenStudentIds.has(student.studentId)) continue;
    seenStudentIds.add(student.studentId);

    const certificateNumber = certByStudentId.get(student.studentId);
    if (certificateNumber) {
      alreadyIssuedStudents.push({ ...student, certificateNumber });
    } else {
      pendingStudents.push(student);
    }
  }

  return {
    programId,
    programTitle: program.titleEn.trim() || program.titleFa.trim() || program.title,
    certificateEnabled: program.certificateEnabled,
    totalEnrolled: seenStudentIds.size,
    alreadyIssued: alreadyIssuedStudents.length,
    pendingIssue: pendingStudents.length,
    pendingStudents,
    alreadyIssuedStudents,
  };
}

export async function bulkIssueCertificatesAdmin(
  programId: string,
  issuedBy: string,
  options?: { studentIds?: string[] }
): Promise<BulkIssueCertificatesResult> {
  const preview = await previewBulkIssueCertificatesAdmin(programId);
  if (!preview.certificateEnabled) {
    throw new Error("Enable certificates on this program first");
  }

  const includeSet =
    options?.studentIds != null ? new Set(options.studentIds) : null;

  const issuedStudentIds = new Set(
    preview.alreadyIssuedStudents.map((student) => student.studentId)
  );
  let issued = 0;
  let alreadyIssued = preview.alreadyIssued;
  const failures: BulkIssueCertificatesResult["failures"] = [];

  for (const student of preview.pendingStudents) {
    if (includeSet && !includeSet.has(student.studentId)) {
      continue;
    }

    if (issuedStudentIds.has(student.studentId)) {
      alreadyIssued++;
      continue;
    }

    try {
      const existing = await loadActiveCertificate(student.studentId, programId);
      if (existing) {
        issuedStudentIds.add(student.studentId);
        alreadyIssued++;
        continue;
      }

      await issueCertificateAdmin(student.studentId, programId, issuedBy);
      issuedStudentIds.add(student.studentId);
      issued++;
    } catch (error) {
      failures.push({
        ...student,
        reason: error instanceof Error ? error.message : "Could not issue certificate",
      });
    }
  }

  return {
    programId: preview.programId,
    programTitle: preview.programTitle,
    issued,
    alreadyIssued,
    failed: failures.length,
    failures,
  };
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
  const certificateEnabled =
    program?.programType !== "bonus" && Boolean(program?.certificateEnabled);

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
