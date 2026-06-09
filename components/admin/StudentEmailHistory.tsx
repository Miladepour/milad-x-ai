"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  StudentEmailCampaign,
  StudentEmailDeliveryStatus,
} from "@/lib/members/types";

interface StudentEmailHistoryProps {
  membersRequest: (action: string, payload?: Record<string, unknown>) => Promise<unknown>;
  refreshKey?: number;
}

const STATUS_LABELS: Record<StudentEmailDeliveryStatus, string> = {
  sent: "Sent",
  delivered: "Delivered",
  opened: "Opened",
  bounced: "Bounced",
  complained: "Complained",
  failed: "Failed",
  delayed: "Delayed",
};

function statusClass(status: StudentEmailDeliveryStatus): string {
  switch (status) {
    case "opened":
      return "border-orange/50 bg-orange/10 text-orange";
    case "delivered":
      return "border-green-500/40 bg-green-500/10 text-green-300";
    case "sent":
      return "border-sky-500/30 bg-sky-500/10 text-sky-200";
    case "delayed":
      return "border-amber-500/40 bg-amber-500/10 text-amber-200";
    case "bounced":
    case "complained":
    case "failed":
      return "border-red-500/40 bg-red-500/10 text-red-300";
    default:
      return "border-white/[0.1] bg-white/[0.04] text-cream/70";
  }
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function countByStatus(
  deliveries: StudentEmailCampaign["deliveries"],
  status: StudentEmailDeliveryStatus
): number {
  return deliveries.filter((item) => item.status === status).length;
}

export default function StudentEmailHistory({
  membersRequest,
  refreshKey = 0,
}: StudentEmailHistoryProps) {
  const [campaigns, setCampaigns] = useState<StudentEmailCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = (await membersRequest("list-student-email-history")) as {
        campaigns: StudentEmailCampaign[];
      };
      setCampaigns(data.campaigns ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load email history");
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  }, [membersRequest]);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  if (loading) {
    return (
      <div className="student-glass-pill p-8 font-dm text-cream/60">
        Loading email history…
      </div>
    );
  }

  if (error) {
    return (
      <div className="student-glass-pill p-8">
        <p className="font-dm text-sm text-red-300">{error}</p>
        <button
          type="button"
          onClick={() => void load()}
          className="mt-4 rounded-full border border-orange/50 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-orange hover:bg-orange hover:text-background"
        >
          Retry
        </button>
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="student-glass-pill p-8 font-dm text-cream/60">
        No student emails sent yet. History appears here after your first send.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-cream/50">
            Recent sends
          </p>
          <p className="mt-1 font-dm text-xs text-cream/45">
            Opens appear after you enable open tracking on your Resend domain and subscribe
            to the <span className="text-cream/60">email.opened</span> webhook event.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="rounded-full border border-white/[0.1] px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-cream/70 hover:border-orange hover:text-orange"
        >
          Refresh
        </button>
      </div>

      <ul className="flex flex-col gap-3">
        {campaigns.map((campaign) => {
          const expanded = expandedId === campaign.id;
          const delivered = countByStatus(campaign.deliveries, "delivered");
          const opened = countByStatus(campaign.deliveries, "opened");
          const sent = countByStatus(campaign.deliveries, "sent");
          const failed = countByStatus(campaign.deliveries, "failed");
          const bounced = countByStatus(campaign.deliveries, "bounced");

          return (
            <li key={campaign.id} className="student-glass-pill overflow-hidden">
              <button
                type="button"
                onClick={() => setExpandedId(expanded ? null : campaign.id)}
                className="flex w-full flex-col gap-3 p-4 text-start"
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <p className="font-dm text-lg text-cream">{campaign.subject}</p>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-cream/50">
                      {campaign.audienceLabel} · {formatDateTime(campaign.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-white/[0.1] px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-cream/70">
                      {campaign.recipientCount} recipients
                    </span>
                    {opened > 0 && (
                      <span
                        className={`rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest ${statusClass("opened")}`}
                      >
                        {opened} opened
                      </span>
                    )}
                    {delivered > 0 && (
                      <span
                        className={`rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest ${statusClass("delivered")}`}
                      >
                        {delivered} delivered
                      </span>
                    )}
                    {sent > 0 && (
                      <span
                        className={`rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest ${statusClass("sent")}`}
                      >
                        {sent} sent
                      </span>
                    )}
                    {failed > 0 && (
                      <span
                        className={`rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest ${statusClass("failed")}`}
                      >
                        {failed} failed
                      </span>
                    )}
                    {bounced > 0 && (
                      <span
                        className={`rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest ${statusClass("bounced")}`}
                      >
                        {bounced} bounced
                      </span>
                    )}
                  </div>
                </div>
              </button>

              {expanded && (
                <div className="border-t border-white/[0.06] px-4 pb-4">
                  <ul className="mt-3 flex flex-col gap-2">
                    {campaign.deliveries.map((delivery) => (
                      <li
                        key={delivery.id}
                        className="flex flex-col gap-2 rounded-xl bg-white/[0.03] p-3 md:flex-row md:items-center md:justify-between"
                      >
                        <div className="min-w-0">
                          <p className="font-dm text-sm text-cream">
                            {delivery.recipientName || delivery.recipientEmail}
                          </p>
                          <p className="font-mono text-[10px] uppercase tracking-widest text-cream/50">
                            {delivery.recipientEmail} · {delivery.locale} · Sent{" "}
                            {formatDateTime(delivery.sentAt)}
                            {delivery.openedAt && (
                              <>
                                {" "}
                                · Opened {formatDateTime(delivery.openedAt)}
                              </>
                            )}
                            {!delivery.openedAt && delivery.deliveredAt && (
                              <>
                                {" "}
                                · Delivered {formatDateTime(delivery.deliveredAt)}
                              </>
                            )}
                          </p>
                          {delivery.statusDetail && (
                            <p className="mt-1 font-dm text-xs text-cream/55">
                              {delivery.statusDetail}
                            </p>
                          )}
                        </div>
                        <span
                          className={`shrink-0 self-start rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-widest ${statusClass(delivery.status)}`}
                        >
                          {STATUS_LABELS[delivery.status]}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
