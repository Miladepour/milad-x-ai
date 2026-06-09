import type { LocaleCode } from "@/lib/supabase/database.types";

export type ProgramStatus = "draft" | "published";
export type EnrollmentStatus = "invited" | "active" | "suspended" | "expired";

export interface UsefulLink {
  label: string;
  url: string;
  sortOrder: number;
}

export interface MemberProgram {
  id: string;
  slug: string;
  title: string;
  description: string;
  coverImage: string | null;
  sortOrder: number;
  status: ProgramStatus;
  usefulLinks: UsefulLink[];
  createdAt: string;
  updatedAt: string;
}

export interface ProgramLesson {
  id: string;
  programId: string;
  title: string;
  description: string;
  videoUrl: string | null;
  sortOrder: number;
  durationMinutes: number | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StudentProfile {
  id: string;
  email: string;
  fullName: string;
  locale: LocaleCode;
  createdAt: string;
}

export interface ProgramEnrollment {
  id: string;
  studentId: string;
  programId: string;
  status: EnrollmentStatus;
  accessStartsAt: string;
  accessEndsAt: string | null;
  invitedAt: string;
  invitedBy: string | null;
  lastAccessedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LessonProgress {
  id: string;
  studentId: string;
  lessonId: string;
  completedAt: string | null;
  lastPositionSeconds: number;
  updatedAt: string;
}

export interface EnrollmentWithDetails extends ProgramEnrollment {
  student?: StudentProfile;
  program?: MemberProgram;
  progressPercent?: number;
  completedLessons?: number;
  totalLessons?: number;
}

export interface StudentDashboardProgram {
  program: MemberProgram;
  enrollment: ProgramEnrollment;
  lessons: ProgramLesson[];
  progressPercent: number;
  completedLessons: number;
  totalLessons: number;
  continueLesson: ProgramLesson | null;
}

export interface MemberProgramPayload {
  id?: string;
  slug: string;
  title: string;
  description: string;
  coverImage?: string | null;
  sortOrder: number;
  status: ProgramStatus;
  usefulLinks: UsefulLink[];
}

export interface ProgramLessonPayload {
  id?: string;
  programId: string;
  title: string;
  description: string;
  videoUrl?: string | null;
  sortOrder: number;
  durationMinutes?: number | null;
  published: boolean;
}

export interface InviteStudentPayload {
  email: string;
  fullName: string;
  locale: LocaleCode;
  programId: string;
  accessStartsAt: string;
  accessEndsAt?: string | null;
}
