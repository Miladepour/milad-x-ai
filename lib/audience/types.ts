export type AudienceLocale = "EN" | "FA";

export type SubscriberStatus = "active" | "unsubscribed";

export type StudentAudienceFilter = "all" | "students" | "non-students";

export interface NewsletterSubscriber {
  id: string;
  email: string;
  isStudent: boolean;
  fullName: string;
  locale: AudienceLocale;
  source: string;
  sourceDetail: string | null;
  status: SubscriberStatus;
  notes: string | null;
  subscribedAt: string;
  unsubscribedAt: string | null;
  createdAt: string;
}

export interface Lead {
  id: string;
  email: string;
  isStudent: boolean;
  fullName: string;
  phone: string | null;
  country: string | null;
  locale: AudienceLocale;
  source: string;
  sourceDetail: string | null;
  notes: string | null;
  createdAt: string;
}

export interface AudienceListResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AudienceCounts {
  subscribers: number;
  subscribersActive: number;
  leads: number;
  waitlist: number;
}

export interface SubscriberListFilters {
  page?: number;
  search?: string;
  source?: string;
  status?: SubscriberStatus | "all";
  studentFilter?: StudentAudienceFilter;
}

export interface LeadListFilters {
  page?: number;
  search?: string;
  source?: string;
  studentFilter?: StudentAudienceFilter;
}

export interface WaitlistListFilters {
  page?: number;
  search?: string;
  courseSlug?: string;
  studentFilter?: StudentAudienceFilter;
}

export interface WaitlistAudienceItem {
  id: string;
  courseSlug: string;
  fullName: string;
  email: string;
  mobile: string;
  country: string;
  locale: string;
  submittedAt: string;
  openedAt: string | null;
  isStudent: boolean;
}

export interface AddSubscriberPayload {
  email: string;
  fullName?: string;
  locale?: AudienceLocale;
  source?: string;
  sourceDetail?: string;
  notes?: string;
}

export interface AddLeadPayload {
  email: string;
  fullName?: string;
  phone?: string;
  country?: string;
  locale?: AudienceLocale;
  source?: string;
  sourceDetail?: string;
  notes?: string;
}

export interface CsvImportResult {
  inserted: number;
  updated: number;
  skipped: number;
  errors: string[];
}
