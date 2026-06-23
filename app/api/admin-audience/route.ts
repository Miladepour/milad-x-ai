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
import type { AudienceEmailAudience, AudienceEmailListType } from "@/lib/audience/email-types";
import {
  createAudienceEmailCampaignAdmin,
  deleteAudienceEmailTemplateAdmin,
  listAudienceEmailHistoryAdmin,
  listAudienceEmailTemplatesAdmin,
  saveAudienceEmailTemplateAdmin,
  sendAudienceEmailBatchAdmin,
} from "@/lib/audience/email-store";
import {
  buildAudienceEmailLabel,
  resolveAudienceEmailRecipients,
} from "@/lib/audience/recipients";
import { previewAudienceBroadcastEmail } from "@/lib/email/audience-broadcast";
import { parseEmailBannerId } from "@/lib/email/banners";
import { sanitizeEmailHtml } from "@/lib/email/sanitize-html";
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

function parseAudienceListType(value: unknown): AudienceEmailListType | null {
  const listType = String(value ?? "");
  if (listType === "subscribers" || listType === "leads" || listType === "waitlist") {
    return listType;
  }
  return null;
}

function parseAudienceEmailAudience(body: Record<string, unknown>): AudienceEmailAudience | null {
  const listType = parseAudienceListType(body.listType);
  if (!listType) return null;
  return {
    listType,
    source: String(body.source ?? "").trim() || undefined,
    courseSlug: String(body.courseSlug ?? "").trim() || undefined,
    studentFilter: parseStudentFilter(body.studentFilter ?? "non-students"),
  };
}

function parsePreviewLocale(value: unknown): "EN" | "FA" {
  return value === "FA" ? "FA" : "EN";
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

    if (action === "preview-audience-email") {
      const subject = String(body.subject ?? "").trim();
      const bodyHtml = sanitizeEmailHtml(String(body.bodyHtml ?? ""));
      const audience = parseAudienceEmailAudience(body);

      if (!subject) {
        return NextResponse.json({ error: "subject is required" }, { status: 400 });
      }
      if (!bodyHtml || bodyHtml === "<p></p>") {
        return NextResponse.json({ error: "email body is required" }, { status: 400 });
      }
      if (!audience) {
        return NextResponse.json({ error: "audience is required" }, { status: 400 });
      }

      const recipients = await resolveAudienceEmailRecipients(audience);
      if (recipients.length === 0) {
        return NextResponse.json({ error: "No recipients match this audience" }, { status: 400 });
      }

      const previewLocale = parsePreviewLocale(body.previewLocale);
      const sample =
        recipients.find((recipient) => recipient.locale === previewLocale) ?? recipients[0];
      const bannerId = parseEmailBannerId(body.bannerId);

      const html = previewAudienceBroadcastEmail({
        bodyHtml,
        recipient: sample,
        bannerId,
      });

      return NextResponse.json({
        ok: true,
        html,
        subject,
        audienceLabel: buildAudienceEmailLabel(audience),
        recipientCount: recipients.length,
        sampleRecipient: sample,
        recipients,
      });
    }

    if (action === "list-audience-email-templates") {
      const templates = await listAudienceEmailTemplatesAdmin();
      return NextResponse.json({ ok: true, templates });
    }

    if (action === "save-audience-email-template") {
      const template = await saveAudienceEmailTemplateAdmin({
        id: body.id ? String(body.id) : null,
        name: String(body.name ?? ""),
        subject: String(body.subject ?? ""),
        bodyHtml: String(body.bodyHtml ?? ""),
      });
      return NextResponse.json({ ok: true, template });
    }

    if (action === "delete-audience-email-template") {
      const id = String(body.id ?? "");
      if (!id) {
        return NextResponse.json({ error: "id required" }, { status: 400 });
      }
      await deleteAudienceEmailTemplateAdmin(id);
      return NextResponse.json({ ok: true });
    }

    if (action === "start-audience-email-campaign") {
      const subject = String(body.subject ?? "").trim();
      const bodyHtml = sanitizeEmailHtml(String(body.bodyHtml ?? ""));
      const audience = parseAudienceEmailAudience(body);

      if (!subject) {
        return NextResponse.json({ error: "subject is required" }, { status: 400 });
      }
      if (!bodyHtml || bodyHtml === "<p></p>") {
        return NextResponse.json({ error: "email body is required" }, { status: 400 });
      }
      if (!audience) {
        return NextResponse.json({ error: "audience is required" }, { status: 400 });
      }

      const recipients = await resolveAudienceEmailRecipients(audience);
      if (recipients.length === 0) {
        return NextResponse.json({ error: "No recipients match this audience" }, { status: 400 });
      }

      const campaignId = await createAudienceEmailCampaignAdmin({
        subject,
        bodyHtml,
        audience,
        recipients,
        sentBy: admin.id,
      });

      return NextResponse.json({
        ok: true,
        campaignId,
        recipientCount: recipients.length,
        audienceLabel: buildAudienceEmailLabel(audience),
      });
    }

    if (action === "send-audience-email-batch") {
      const campaignId = String(body.campaignId ?? "");
      if (!campaignId) {
        return NextResponse.json({ error: "campaignId is required" }, { status: 400 });
      }
      const result = await sendAudienceEmailBatchAdmin(campaignId);
      return NextResponse.json({ ok: true, ...result });
    }

    if (action === "list-audience-email-history") {
      const campaigns = await listAudienceEmailHistoryAdmin();
      return NextResponse.json({ ok: true, campaigns });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("[admin-audience]", error);
    const message = error instanceof Error ? error.message : SERVER_ERROR_MESSAGE;
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
