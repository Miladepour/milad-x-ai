import type {
  EnrollmentStatus,
  LessonProgress,
  MemberProgram,
  PaymentCurrency,
  ProgramEnrollment,
  ProgramLesson,
  ProgramStatus,
  StudentProfile,
  UsefulLink,
} from "./types";

export interface MemberProgramRow {
  id: string;
  slug: string;
  title: string;
  description: string;
  cover_image: string | null;
  sort_order: number;
  status: string;
  useful_links: unknown;
  certificate_enabled?: boolean | null;
  certificate_title_en?: string | null;
  certificate_title_fa?: string | null;
  certificate_hours?: number | string | null;
  coming_soon?: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface ProgramLessonRow {
  id: string;
  program_id: string;
  lesson_type?: string | null;
  title_en?: string | null;
  title_fa?: string | null;
  body_en?: string | null;
  body_fa?: string | null;
  title: string;
  description: string;
  video_url: string | null;
  sort_order: number;
  duration_minutes: number | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface StudentProfileRow {
  id: string;
  email: string;
  full_name: string;
  student_number?: string | null;
  locale: string;
  phone?: string | null;
  notes?: string | null;
  created_at: string;
}

export interface ProgramEnrollmentRow {
  id: string;
  student_id: string;
  program_id: string;
  status: string;
  access_starts_at: string;
  access_ends_at: string | null;
  amount_paid?: number | null;
  currency?: string | null;
  invited_at: string;
  invited_by: string | null;
  last_accessed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface LessonProgressRow {
  id: string;
  student_id: string;
  lesson_id: string;
  completed_at: string | null;
  last_position_seconds: number;
  updated_at: string;
}

function parseUsefulLinks(raw: unknown): UsefulLink[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item, index) => {
      if (!item || typeof item !== "object") return null;
      const o = item as Record<string, unknown>;
      const label = String(o.label ?? "").trim();
      const url = String(o.url ?? "").trim();
      if (!label || !url) return null;
      return {
        label,
        url,
        sortOrder: typeof o.sortOrder === "number" ? o.sortOrder : index,
      };
    })
    .filter((x): x is UsefulLink => x !== null)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function memberProgramRowToProgram(row: MemberProgramRow): MemberProgram {
  const hoursRaw = row.certificate_hours;
  const certificateHours =
    hoursRaw == null || hoursRaw === ""
      ? null
      : typeof hoursRaw === "number"
        ? hoursRaw
        : Number(hoursRaw);

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    coverImage: row.cover_image,
    sortOrder: row.sort_order,
    status: row.status as ProgramStatus,
    usefulLinks: parseUsefulLinks(row.useful_links),
    certificateEnabled: Boolean(row.certificate_enabled),
    certificateTitleEn: row.certificate_title_en?.trim() || null,
    certificateTitleFa: row.certificate_title_fa?.trim() || null,
    certificateHours:
      certificateHours != null && Number.isFinite(certificateHours)
        ? certificateHours
        : null,
    comingSoon: Boolean(row.coming_soon),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function programLessonRowToLesson(row: ProgramLessonRow): ProgramLesson {
  const titleEn = (row.title_en ?? row.title ?? "").trim();
  const titleFa = (row.title_fa ?? row.title ?? "").trim();
  const bodyEn = (row.body_en ?? row.description ?? "").trim();
  const bodyFa = (row.body_fa ?? row.description ?? "").trim();
  const lessonType =
    row.lesson_type === "text" || row.lesson_type === "quiz" || row.lesson_type === "video"
      ? row.lesson_type
      : row.video_url
        ? "video"
        : "text";

  return {
    id: row.id,
    programId: row.program_id,
    lessonType,
    titleEn,
    titleFa,
    bodyEn,
    bodyFa,
    title: titleEn || titleFa || row.title,
    description: bodyEn || bodyFa || row.description,
    videoUrl: row.video_url,
    sortOrder: row.sort_order,
    durationMinutes: row.duration_minutes,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function parseCurrency(value: string | null | undefined): PaymentCurrency | null {
  if (value === "USD" || value === "GBP" || value === "IRR") return value;
  return null;
}

export function studentProfileRowToProfile(row: StudentProfileRow): StudentProfile {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    studentNumber: row.student_number ?? "",
    locale: row.locale === "FA" ? "FA" : "EN",
    phone: row.phone ?? null,
    notes: row.notes ?? null,
    createdAt: row.created_at,
  };
}

export function enrollmentRowToEnrollment(row: ProgramEnrollmentRow): ProgramEnrollment {
  return {
    id: row.id,
    studentId: row.student_id,
    programId: row.program_id,
    status: row.status as EnrollmentStatus,
    accessStartsAt: row.access_starts_at,
    accessEndsAt: row.access_ends_at,
    amountPaid: row.amount_paid != null ? Number(row.amount_paid) : null,
    currency: parseCurrency(row.currency),
    invitedAt: row.invited_at,
    invitedBy: row.invited_by,
    lastAccessedAt: row.last_accessed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function progressRowToProgress(row: LessonProgressRow): LessonProgress {
  return {
    id: row.id,
    studentId: row.student_id,
    lessonId: row.lesson_id,
    completedAt: row.completed_at,
    lastPositionSeconds: row.last_position_seconds,
    updatedAt: row.updated_at,
  };
}

export function usefulLinksToJson(links: UsefulLink[]): unknown {
  return links.map((l) => ({
    label: l.label,
    url: l.url,
    sortOrder: l.sortOrder,
  }));
}
