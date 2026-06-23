import { NextResponse } from "next/server";
import {
  LEAD_CSV_HEADERS,
  SUBSCRIBER_CSV_HEADERS,
  csvRowsToRecords,
  parseCsvRows,
} from "@/lib/audience/csv";
import {
  addLeadAdmin,
  addSubscriberAdmin,
  getAudienceCountsAdmin,
  importLeadsCsvAdmin,
  importSubscribersCsvAdmin,
  listLeadSourcesAdmin,
  listLeadsAdmin,
  listSubscriberSourcesAdmin,
  listSubscribersAdmin,
  listWaitlistAdmin,
  listWaitlistCourseSlugsAdmin,
} from "@/lib/audience/store";
import type { SubscriberStatus, StudentAudienceFilter } from "@/lib/audience/types";
import { createAdminDbClient } from "@/lib/supabase/admin-client";
import { markNotificationsReadByReference } from "@/lib/notifications/store";
import { SERVER_ERROR_MESSAGE } from "@/lib/security/api-errors";
import { getAdminUser } from "@/lib/supabase/require-admin";

function parseSubscriberStatus(value: unknown): SubscriberStatus | "all" {
  const status = String(value ?? "all");
  if (status === "active" || status === "unsubscribed") return status;
  return "all";
}

function parseStudentFilter(value: unknown): StudentAudienceFilter {
  const filter = String(value ?? "all");
  if (filter === "students" || filter === "non-students") return filter;
  return "all";
}

export async function POST(request: Request) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const action = String(body.action ?? "");

    if (action === "counts") {
      const counts = await getAudienceCountsAdmin();
      const [subscriberSources, leadSources, waitlistCourses] = await Promise.all([
        listSubscriberSourcesAdmin(),
        listLeadSourcesAdmin(),
        listWaitlistCourseSlugsAdmin(),
      ]);
      return NextResponse.json({
        ok: true,
        counts,
        subscriberSources,
        leadSources,
        waitlistCourses,
      });
    }

    if (action === "list-subscribers") {
      const result = await listSubscribersAdmin({
        page: Number(body.page) || 1,
        search: String(body.search ?? ""),
        source: String(body.source ?? ""),
        status: parseSubscriberStatus(body.status),
        studentFilter: parseStudentFilter(body.studentFilter),
      });
      return NextResponse.json({ ok: true, ...result });
    }

    if (action === "list-leads") {
      const result = await listLeadsAdmin({
        page: Number(body.page) || 1,
        search: String(body.search ?? ""),
        source: String(body.source ?? ""),
        studentFilter: parseStudentFilter(body.studentFilter),
      });
      return NextResponse.json({ ok: true, ...result });
    }

    if (action === "list-waitlist") {
      const result = await listWaitlistAdmin({
        page: Number(body.page) || 1,
        search: String(body.search ?? ""),
        courseSlug: String(body.courseSlug ?? ""),
        studentFilter: parseStudentFilter(body.studentFilter),
      });
      return NextResponse.json({ ok: true, ...result });
    }

    if (action === "add-subscriber") {
      const subscriber = await addSubscriberAdmin({
        email: String(body.email ?? ""),
        fullName: String(body.fullName ?? ""),
        locale: body.locale === "FA" ? "FA" : "EN",
        source: String(body.source ?? "manual"),
        sourceDetail: body.sourceDetail ? String(body.sourceDetail) : undefined,
        notes: body.notes ? String(body.notes) : undefined,
      });
      return NextResponse.json({ ok: true, subscriber });
    }

    if (action === "add-lead") {
      const lead = await addLeadAdmin({
        email: String(body.email ?? ""),
        fullName: String(body.fullName ?? ""),
        phone: body.phone ? String(body.phone) : undefined,
        country: body.country ? String(body.country) : undefined,
        locale: body.locale === "FA" ? "FA" : "EN",
        source: String(body.source ?? "manual"),
        sourceDetail: body.sourceDetail ? String(body.sourceDetail) : undefined,
        notes: body.notes ? String(body.notes) : undefined,
      });
      return NextResponse.json({ ok: true, lead });
    }

    if (action === "import-subscribers" || action === "import-leads") {
      const csvText = String(body.csvText ?? "");
      const rows = parseCsvRows(csvText);
      const headers = action === "import-subscribers" ? SUBSCRIBER_CSV_HEADERS : LEAD_CSV_HEADERS;
      const { records, errors: parseErrors } = csvRowsToRecords(rows, headers);
      if (parseErrors.length > 0 && records.length === 0) {
        return NextResponse.json({ error: parseErrors[0] }, { status: 400 });
      }

      const result =
        action === "import-subscribers"
          ? await importSubscribersCsvAdmin(records)
          : await importLeadsCsvAdmin(records);

      return NextResponse.json({
        ok: true,
        ...result,
        errors: [...parseErrors, ...result.errors],
      });
    }

    if (action === "mark-waitlist-opened") {
      const id = String(body.id ?? "");
      if (!id) {
        return NextResponse.json({ error: "id required" }, { status: 400 });
      }
      const adminDb = createAdminDbClient();
      const { error } = await adminDb
        .from("waitlist_submissions")
        .update({ opened_at: new Date().toISOString() })
        .eq("id", id)
        .is("opened_at", null);
      if (error) throw new Error(error.message);
      await markNotificationsReadByReference(admin.id, "waitlist", id);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("[admin-audience]", error);
    const message = error instanceof Error ? error.message : SERVER_ERROR_MESSAGE;
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
