import type { AudienceEmailAudience, AudienceEmailRecipient } from "@/lib/audience/email-types";
import {
  listLeadsAdmin,
  listSubscribersAdmin,
  listWaitlistAdmin,
} from "@/lib/audience/store";

function dedupeRecipients(recipients: AudienceEmailRecipient[]): AudienceEmailRecipient[] {
  const seen = new Set<string>();
  const result: AudienceEmailRecipient[] = [];
  for (const recipient of recipients) {
    const key = recipient.email.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push({ ...recipient, email: key });
  }
  return result;
}

async function fetchAllPages<T extends { email: string; fullName: string; locale: string }>(
  fetchPage: (page: number) => Promise<{ items: T[]; totalPages: number }>,
  mapItem: (item: T) => AudienceEmailRecipient
): Promise<AudienceEmailRecipient[]> {
  const recipients: AudienceEmailRecipient[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const result = await fetchPage(page);
    recipients.push(...result.items.map(mapItem));
    totalPages = result.totalPages;
    page += 1;
  }

  return recipients;
}

export async function resolveAudienceEmailRecipients(
  audience: AudienceEmailAudience
): Promise<AudienceEmailRecipient[]> {
  const studentFilter = audience.studentFilter ?? "non-students";
  const source = audience.source?.trim() ?? "";
  const courseSlug = audience.courseSlug?.trim() ?? "";

  if (audience.listType === "subscribers") {
    const recipients = await fetchAllPages(
      (page) =>
        listSubscribersAdmin({
          page,
          source,
          status: "active",
          studentFilter,
        }),
      (item) => ({
        email: item.email,
        fullName: item.fullName,
        locale: item.locale === "FA" ? "FA" : "EN",
      })
    );
    return dedupeRecipients(recipients);
  }

  if (audience.listType === "leads") {
    const recipients = await fetchAllPages(
      (page) =>
        listLeadsAdmin({
          page,
          source,
          studentFilter,
        }),
      (item) => ({
        email: item.email,
        fullName: item.fullName,
        locale: item.locale === "FA" ? "FA" : "EN",
      })
    );
    return dedupeRecipients(recipients);
  }

  const recipients = await fetchAllPages(
    (page) =>
      listWaitlistAdmin({
        page,
        courseSlug,
        studentFilter,
      }),
    (item) => ({
      email: item.email,
      fullName: item.fullName,
      locale: item.locale === "FA" ? "FA" : "EN",
    })
  );
  return dedupeRecipients(recipients);
}

export function buildAudienceEmailLabel(audience: AudienceEmailAudience): string {
  const parts: string[] = [];
  if (audience.listType === "subscribers") parts.push("Subscribers");
  if (audience.listType === "leads") parts.push("Leads");
  if (audience.listType === "waitlist") parts.push("Waitlist");

  if (audience.source?.trim()) parts.push(`source: ${audience.source.trim()}`);
  if (audience.courseSlug?.trim()) parts.push(`course: ${audience.courseSlug.trim()}`);

  const studentFilter = audience.studentFilter ?? "non-students";
  if (studentFilter === "non-students") parts.push("non-students only");
  if (studentFilter === "students") parts.push("students only");

  return parts.join(" · ");
}
