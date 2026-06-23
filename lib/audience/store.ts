import type {
  AddLeadPayload,
  AddSubscriberPayload,
  AudienceCounts,
  AudienceListResult,
  AudienceLocale,
  CsvImportResult,
  Lead,
  LeadListFilters,
  NewsletterSubscriber,
  SubscriberListFilters,
  SubscriberStatus,
  StudentAudienceFilter,
  WaitlistAudienceItem,
  WaitlistListFilters,
} from "@/lib/audience/types";
import { waitlistRowToSubmission } from "@/lib/supabase/mappers";
import type { WaitlistSubmissionRow } from "@/lib/supabase/database.types";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export const AUDIENCE_PAGE_SIZE = 20;

interface NewsletterSubscriberRow {
  id: string;
  email: string;
  full_name: string;
  locale: AudienceLocale;
  source: string;
  source_detail: string | null;
  status: SubscriberStatus;
  notes: string | null;
  subscribed_at: string;
  unsubscribed_at: string | null;
  created_at: string;
}

interface LeadRow {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  country: string | null;
  locale: AudienceLocale;
  source: string;
  source_detail: string | null;
  notes: string | null;
  created_at: string;
}

function subscriberRowToProfile(
  row: NewsletterSubscriberRow
): Omit<NewsletterSubscriber, "isStudent"> {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    locale: row.locale,
    source: row.source,
    sourceDetail: row.source_detail,
    status: row.status,
    notes: row.notes,
    subscribedAt: row.subscribed_at,
    unsubscribedAt: row.unsubscribed_at,
    createdAt: row.created_at,
  };
}

function leadRowToProfile(row: LeadRow): Omit<Lead, "isStudent"> {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    phone: row.phone,
    country: row.country,
    locale: row.locale,
    source: row.source,
    sourceDetail: row.source_detail,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function parseLocale(value: string | undefined): AudienceLocale {
  return value?.trim().toUpperCase() === "FA" ? "FA" : "EN";
}

function buildListResult<T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number
): AudienceListResult<T> {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return {
    items,
    total,
    page,
    pageSize,
    totalPages,
  };
}

function applySearchOr(query: string, columns: string[]): string {
  const escaped = query.replace(/[%_,]/g, "");
  if (!escaped) return "";
  const pattern = `%${escaped}%`;
  return columns.map((column) => `${column}.ilike.${pattern}`).join(",");
}

async function loadStudentEmailSet(): Promise<Set<string>> {
  const supabase = createClient();
  const { data, error } = await supabase.from("student_profiles").select("email");
  if (error) throw new Error(error.message);
  return new Set((data ?? []).map((row) => normalizeEmail(row.email)));
}

function withStudentFlag<T extends { email: string }>(
  item: T,
  studentEmails: Set<string>
): T & { isStudent: boolean } {
  return {
    ...item,
    isStudent: studentEmails.has(normalizeEmail(item.email)),
  };
}

function applyStudentEmailFilter<
  T extends {
    in: (column: string, values: string[]) => T;
    not: (column: string, operator: string, value: string) => T;
  },
>(query: T, studentEmails: Set<string>, filter: StudentAudienceFilter | undefined): T {
  const studentFilter = filter ?? "all";
  if (studentFilter === "all") return query;

  const emails = Array.from(studentEmails);
  if (studentFilter === "students") {
    return query.in("email", emails.length > 0 ? emails : ["__no_student_emails__"]);
  }

  if (emails.length === 0) return query;

  const quoted = emails.map((email) => `"${email.replace(/"/g, "")}"`).join(",");
  return query.not("email", "in", `(${quoted})`);
}

export async function getAudienceCountsAdmin(): Promise<AudienceCounts> {
  const supabase = createClient();
  const [subscribers, subscribersActive, leads, waitlist] = await Promise.all([
    supabase.from("newsletter_subscribers").select("*", { count: "exact", head: true }),
    supabase
      .from("newsletter_subscribers")
      .select("*", { count: "exact", head: true })
      .eq("status", "active"),
    supabase.from("leads").select("*", { count: "exact", head: true }),
    supabase.from("waitlist_submissions").select("*", { count: "exact", head: true }),
  ]);

  if (subscribers.error) throw new Error(subscribers.error.message);
  if (subscribersActive.error) throw new Error(subscribersActive.error.message);
  if (leads.error) throw new Error(leads.error.message);
  if (waitlist.error) throw new Error(waitlist.error.message);

  return {
    subscribers: subscribers.count ?? 0,
    subscribersActive: subscribersActive.count ?? 0,
    leads: leads.count ?? 0,
    waitlist: waitlist.count ?? 0,
  };
}

export async function listSubscriberSourcesAdmin(): Promise<string[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("newsletter_subscribers").select("source");
  if (error) throw new Error(error.message);
  return Array.from(new Set((data ?? []).map((row) => row.source).filter(Boolean))).sort();
}

export async function listLeadSourcesAdmin(): Promise<string[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("leads").select("source");
  if (error) throw new Error(error.message);
  return Array.from(new Set((data ?? []).map((row) => row.source).filter(Boolean))).sort();
}

export async function listWaitlistCourseSlugsAdmin(): Promise<string[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("waitlist_submissions").select("course_slug");
  if (error) throw new Error(error.message);
  return Array.from(new Set((data ?? []).map((row) => row.course_slug).filter(Boolean))).sort();
}

export async function listSubscribersAdmin(
  filters: SubscriberListFilters = {}
): Promise<AudienceListResult<NewsletterSubscriber>> {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = AUDIENCE_PAGE_SIZE;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const search = filters.search?.trim() ?? "";
  const source = filters.source?.trim() ?? "";
  const status = filters.status ?? "all";
  const studentFilter = filters.studentFilter ?? "all";

  const supabase = createClient();
  const studentEmails = await loadStudentEmailSet();

  if (studentFilter === "students" && studentEmails.size === 0) {
    return buildListResult([], 0, page, pageSize);
  }

  let query = supabase
    .from("newsletter_subscribers")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (status !== "all") {
    query = query.eq("status", status);
  }
  if (source) {
    query = query.eq("source", source);
  }
  if (search) {
    query = query.or(applySearchOr(search, ["email", "full_name", "source", "source_detail"]));
  }

  query = applyStudentEmailFilter(query, studentEmails, studentFilter);

  const { data, error, count } = await query.range(from, to);
  if (error) throw new Error(error.message);

  return buildListResult(
    (data as NewsletterSubscriberRow[])
      .map(subscriberRowToProfile)
      .map((item) => withStudentFlag(item, studentEmails)),
    count ?? 0,
    page,
    pageSize
  );
}

export async function listLeadsAdmin(
  filters: LeadListFilters = {}
): Promise<AudienceListResult<Lead>> {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = AUDIENCE_PAGE_SIZE;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const search = filters.search?.trim() ?? "";
  const source = filters.source?.trim() ?? "";
  const studentFilter = filters.studentFilter ?? "all";

  const supabase = createClient();
  const studentEmails = await loadStudentEmailSet();

  if (studentFilter === "students" && studentEmails.size === 0) {
    return buildListResult([], 0, page, pageSize);
  }

  let query = supabase
    .from("leads")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (source) {
    query = query.eq("source", source);
  }
  if (search) {
    query = query.or(
      applySearchOr(search, ["email", "full_name", "phone", "country", "source", "source_detail"])
    );
  }

  query = applyStudentEmailFilter(query, studentEmails, studentFilter);

  const { data, error, count } = await query.range(from, to);
  if (error) throw new Error(error.message);

  return buildListResult(
    (data as LeadRow[])
      .map(leadRowToProfile)
      .map((item) => withStudentFlag(item, studentEmails)),
    count ?? 0,
    page,
    pageSize
  );
}

export async function listWaitlistAdmin(
  filters: WaitlistListFilters = {}
): Promise<AudienceListResult<WaitlistAudienceItem>> {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = AUDIENCE_PAGE_SIZE;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const search = filters.search?.trim() ?? "";
  const courseSlug = filters.courseSlug?.trim() ?? "";
  const studentFilter = filters.studentFilter ?? "all";

  const supabase = createClient();
  const studentEmails = await loadStudentEmailSet();

  if (studentFilter === "students" && studentEmails.size === 0) {
    return buildListResult([], 0, page, pageSize);
  }

  let query = supabase
    .from("waitlist_submissions")
    .select("*", { count: "exact" })
    .order("submitted_at", { ascending: false });

  if (courseSlug) {
    query = query.eq("course_slug", courseSlug);
  }
  if (search) {
    query = query.or(
      applySearchOr(search, ["email", "full_name", "mobile", "country", "course_slug"])
    );
  }

  query = applyStudentEmailFilter(query, studentEmails, studentFilter);

  const { data, error, count } = await query.range(from, to);
  if (error) throw new Error(error.message);

  return buildListResult(
    (data as WaitlistSubmissionRow[])
      .map(waitlistRowToSubmission)
      .map((item) => withStudentFlag(item, studentEmails)),
    count ?? 0,
    page,
    pageSize
  );
}

export async function addSubscriberAdmin(
  payload: AddSubscriberPayload
): Promise<NewsletterSubscriber> {
  const email = normalizeEmail(payload.email);
  if (!isValidEmail(email)) {
    throw new Error("Invalid email address");
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("newsletter_subscribers")
    .upsert(
      {
        email,
        full_name: payload.fullName?.trim() ?? "",
        locale: parseLocale(payload.locale),
        source: payload.source?.trim() || "manual",
        source_detail: payload.sourceDetail?.trim() || null,
        notes: payload.notes?.trim() || null,
        status: "active",
        unsubscribed_at: null,
      },
      { onConflict: "email" }
    )
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  const studentEmails = await loadStudentEmailSet();
  return withStudentFlag(
    subscriberRowToProfile(data as NewsletterSubscriberRow),
    studentEmails
  );
}

export async function addLeadAdmin(payload: AddLeadPayload): Promise<Lead> {
  const email = normalizeEmail(payload.email);
  if (!isValidEmail(email)) {
    throw new Error("Invalid email address");
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("leads")
    .upsert(
      {
        email,
        full_name: payload.fullName?.trim() ?? "",
        phone: payload.phone?.trim() || null,
        country: payload.country?.trim() || null,
        locale: parseLocale(payload.locale),
        source: payload.source?.trim() || "manual",
        source_detail: payload.sourceDetail?.trim() || null,
        notes: payload.notes?.trim() || null,
      },
      { onConflict: "email" }
    )
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  const studentEmails = await loadStudentEmailSet();
  return withStudentFlag(leadRowToProfile(data as LeadRow), studentEmails);
}

export async function importSubscribersCsvAdmin(
  records: Record<string, string>[]
): Promise<CsvImportResult> {
  let inserted = 0;
  let updated = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (let index = 0; index < records.length; index += 1) {
    const record = records[index];
    const email = normalizeEmail(record.email ?? "");
    if (!isValidEmail(email)) {
      skipped += 1;
      errors.push(`Row ${index + 2}: invalid email`);
      continue;
    }

    try {
      const supabase = createClient();
      const existing = await supabase
        .from("newsletter_subscribers")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      await addSubscriberAdmin({
        email,
        fullName: record.full_name,
        locale: parseLocale(record.locale),
        source: record.source?.trim() || "import",
        sourceDetail: record.source_detail,
        notes: record.notes,
      });

      if (existing.data?.id) updated += 1;
      else inserted += 1;
    } catch (err) {
      skipped += 1;
      errors.push(
        `Row ${index + 2}: ${err instanceof Error ? err.message : "Import failed"}`
      );
    }
  }

  return { inserted, updated, skipped, errors };
}

export async function importLeadsCsvAdmin(
  records: Record<string, string>[]
): Promise<CsvImportResult> {
  let inserted = 0;
  let updated = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (let index = 0; index < records.length; index += 1) {
    const record = records[index];
    const email = normalizeEmail(record.email ?? "");
    if (!isValidEmail(email)) {
      skipped += 1;
      errors.push(`Row ${index + 2}: invalid email`);
      continue;
    }

    try {
      const supabase = createClient();
      const existing = await supabase
        .from("leads")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      await addLeadAdmin({
        email,
        fullName: record.full_name,
        phone: record.phone,
        country: record.country,
        locale: parseLocale(record.locale),
        source: record.source?.trim() || "import",
        sourceDetail: record.source_detail,
        notes: record.notes,
      });

      if (existing.data?.id) updated += 1;
      else inserted += 1;
    } catch (err) {
      skipped += 1;
      errors.push(
        `Row ${index + 2}: ${err instanceof Error ? err.message : "Import failed"}`
      );
    }
  }

  return { inserted, updated, skipped, errors };
}

export async function subscribeNewsletterPublic(payload: {
  email: string;
  locale: AudienceLocale;
}): Promise<void> {
  const email = normalizeEmail(payload.email);
  if (!isValidEmail(email)) {
    throw new Error("Invalid email address");
  }

  const supabase = createServiceClient();
  const { error } = await supabase.from("newsletter_subscribers").upsert(
    {
      email,
      full_name: "",
      locale: payload.locale,
      source: "website",
      source_detail: null,
      notes: null,
      status: "active",
      unsubscribed_at: null,
    },
    { onConflict: "email" }
  );

  if (error) throw new Error(error.message);
}
