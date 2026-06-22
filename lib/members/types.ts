import type { LocaleCode } from "@/lib/supabase/database.types";

export type ProgramStatus = "draft" | "published";
export type EnrollmentStatus = "invited" | "active" | "suspended" | "expired";
export type PaymentCurrency = "USD" | "GBP" | "IRR";
export type LessonType = "video" | "text" | "quiz";

export interface UsefulLink {
  label: string;
  url: string;
  sortOrder: number;
}

export interface MemberProgram {
  id: string;
  slug: string;
  titleEn: string;
  titleFa: string;
  descriptionEn: string;
  descriptionFa: string;
  /** @deprecated Use titleEn/titleFa via resolveProgramTitle */
  title: string;
  /** @deprecated Use descriptionEn/descriptionFa via resolveProgramDescription */
  description: string;
  coverImage: string | null;
  sortOrder: number;
  status: ProgramStatus;
  usefulLinks: UsefulLink[];
  certificateEnabled: boolean;
  certificateTitleEn: string | null;
  certificateTitleFa: string | null;
  /** Admin override; when null, hours are summed from published lesson durations */
  certificateHours: number | null;
  /** When true, enrolled students see the program but lesson content stays locked. */
  comingSoon: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProgramCertificate {
  id: string;
  certificateNumber: string;
  studentId: string;
  programId: string;
  enrollmentId: string | null;
  studentName: string;
  studentNumber: string;
  programTitleEn: string;
  programTitleFa: string;
  totalHours: number;
  issuedAt: string;
  issuedBy: string | null;
  revokedAt: string | null;
  createdAt: string;
}

export interface ProgramLesson {
  id: string;
  programId: string;
  lessonType: LessonType;
  titleEn: string;
  titleFa: string;
  bodyEn: string;
  bodyFa: string;
  /** @deprecated Use titleEn/titleFa via resolveLessonTitle */
  title: string;
  /** @deprecated Use bodyEn/bodyFa via resolveLessonBody */
  description: string;
  videoUrl: string | null;
  sortOrder: number;
  durationMinutes: number | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LessonQuizOption {
  id: string;
  questionId: string;
  sortOrder: number;
  labelEn: string;
  labelFa: string;
  isCorrect: boolean;
}

export interface LessonQuizQuestion {
  id: string;
  lessonId: string;
  sortOrder: number;
  promptEn: string;
  promptFa: string;
  explanationEn: string;
  explanationFa: string;
  options: LessonQuizOption[];
}

export interface LessonQuizOptionStudent {
  id: string;
  sortOrder: number;
  label: string;
}

export interface LessonQuizQuestionStudent {
  id: string;
  sortOrder: number;
  prompt: string;
  options: LessonQuizOptionStudent[];
}

export interface LessonQuizSubmitResult {
  scorePercent: number;
  passed: boolean;
  totalQuestions: number;
  correctCount: number;
  results: Array<{
    questionId: string;
    prompt: string;
    selectedOptionId: string | null;
    correctOptionId: string;
    correctLabel: string;
    selectedLabel: string | null;
    isCorrect: boolean;
    explanation: string;
  }>;
}

export interface QuizOptionPayload {
  id?: string;
  labelEn: string;
  labelFa: string;
  isCorrect: boolean;
  sortOrder: number;
}

export interface QuizQuestionPayload {
  id?: string;
  promptEn: string;
  promptFa: string;
  explanationEn?: string;
  explanationFa?: string;
  sortOrder: number;
  options: QuizOptionPayload[];
}

export interface StudentProfile {
  id: string;
  email: string;
  fullName: string;
  /** Public student ID, e.g. MXAI10482 */
  studentNumber: string;
  locale: LocaleCode;
  phone: string | null;
  notes: string | null;
  createdAt: string;
}

export interface ProgramEnrollment {
  id: string;
  studentId: string;
  programId: string;
  status: EnrollmentStatus;
  accessStartsAt: string;
  accessEndsAt: string | null;
  amountPaid: number | null;
  currency: PaymentCurrency | null;
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
  /** Timestamp used to pick the most recently active program for Continue watching. */
  continueWatchingAt: number;
}

export interface MemberProgramPayload {
  id?: string;
  slug: string;
  titleEn: string;
  titleFa: string;
  descriptionEn: string;
  descriptionFa: string;
  coverImage?: string | null;
  sortOrder: number;
  status: ProgramStatus;
  usefulLinks: UsefulLink[];
  certificateEnabled?: boolean;
  certificateTitleEn?: string | null;
  certificateTitleFa?: string | null;
  certificateHours?: number | null;
  comingSoon?: boolean;
}

export interface ProgramLessonPayload {
  id?: string;
  programId: string;
  lessonType: LessonType;
  titleEn: string;
  titleFa: string;
  bodyEn: string;
  bodyFa: string;
  videoUrl?: string | null;
  sortOrder: number;
  durationMinutes?: number | null;
  published: boolean;
}

export type StudentInviteDuplicateKind = "none" | "new_program" | "same_program";

export interface StudentInviteCheck {
  exists: boolean;
  duplicateKind: StudentInviteDuplicateKind;
  programTitle: string;
  student?: StudentProfile;
  existingEnrollment?: EnrollmentWithDetails;
  enrollments?: EnrollmentWithDetails[];
}

export interface InviteStudentPayload {
  email: string;
  fullName: string;
  locale: LocaleCode;
  phone?: string | null;
  notes?: string | null;
  programId: string;
  accessStartsAt: string;
  accessEndsAt?: string | null;
  amountPaid?: number | null;
  currency?: PaymentCurrency | null;
  allowExisting?: boolean;
}

export interface UpdateStudentPayload {
  studentId: string;
  fullName?: string;
  locale?: LocaleCode;
  phone?: string | null;
  notes?: string | null;
}

export interface StudentSelfUpdatePayload {
  fullName?: string;
  locale?: LocaleCode;
  phone?: string | null;
}

export interface StudentProfileEnrollmentSummary {
  id: string;
  programTitle: string;
  programSlug: string;
  status: EnrollmentStatus;
  amountPaid: number | null;
  currency: PaymentCurrency | null;
  enrolledAt: string;
  accessEndsAt: string | null;
}

export interface StudentProfileAccount {
  profile: StudentProfile;
  enrollments: StudentProfileEnrollmentSummary[];
}

export interface AddEnrollmentPayload {
  studentId: string;
  programId: string;
  accessStartsAt: string;
  accessEndsAt?: string | null;
  amountPaid?: number | null;
  currency?: PaymentCurrency | null;
  status?: EnrollmentStatus;
}

export interface StudentWithEnrollments {
  profile: StudentProfile;
  enrollments: EnrollmentWithDetails[];
  certificatesByProgramId: Record<string, ProgramCertificate>;
}

export type AnnouncementLocale = "EN" | "FA" | "ALL";

export type StudentAnnouncementAudienceType = "all" | "student" | "programs";

export interface StudentAnnouncement {
  id: string;
  title: string;
  body: string;
  locale: AnnouncementLocale;
  audienceType: StudentAnnouncementAudienceType;
  studentId: string | null;
  programIds: string[];
  linkUrl: string | null;
  linkLabel: string | null;
  publishedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StudentAnnouncementWithState extends StudentAnnouncement {
  readAt: string | null;
  dismissedAt: string | null;
  isRead: boolean;
  isDismissed: boolean;
}

export interface StudentAnnouncementPayload {
  id?: string;
  title: string;
  body: string;
  locale?: AnnouncementLocale;
  audienceType: StudentAnnouncementAudienceType;
  studentId?: string | null;
  programIds?: string[];
  linkUrl?: string | null;
  linkLabel?: string | null;
  published: boolean;
  expiresAt?: string | null;
}

export type StudentEmailDeliveryStatus =
  | "sent"
  | "delivered"
  | "opened"
  | "bounced"
  | "complained"
  | "failed"
  | "delayed";

export type StudentEmailAudienceType = "all" | "student" | "program";

export interface StudentEmailDelivery {
  id: string;
  campaignId: string;
  studentId: string | null;
  recipientEmail: string;
  recipientName: string;
  locale: LocaleCode;
  resendMessageId: string | null;
  status: StudentEmailDeliveryStatus;
  statusDetail: string | null;
  sentAt: string;
  deliveredAt: string | null;
  openedAt: string | null;
  updatedAt: string;
}

export interface StudentEmailCampaign {
  id: string;
  subject: string;
  bodyHtml: string;
  audienceType: StudentEmailAudienceType;
  audienceLabel: string;
  programId: string | null;
  studentId: string | null;
  sentBy: string | null;
  recipientCount: number;
  sentCount: number;
  failedCount: number;
  createdAt: string;
  deliveries: StudentEmailDelivery[];
}
