"use client";

import { useEffect, useState } from "react";
import { MonitorSmartphone } from "lucide-react";
import StudentGlassCard from "@/components/members/StudentGlassCard";
import { formatDateOnly } from "@/lib/members/dates";
import type { StudentDevice } from "@/lib/members/types";

export interface StudentDevicesLabels {
  sectionTitle: string;
  sectionSubtitle: string;
  softModeNote: string;
  lastSeen: string;
  currentDevice: string;
  remove: string;
  removing: string;
  removeFailed: string;
  noDevices: string;
  loading: string;
}

interface StudentDevicesSectionProps {
  initialDevices: StudentDevice[];
  dateLocale: "en-GB" | "fa-IR";
  urlLocale: "en" | "fa";
  softMode: boolean;
  labels: StudentDevicesLabels;
}

export default function StudentDevicesSection({
  initialDevices,
  dateLocale,
  urlLocale,
  softMode,
  labels,
}: StudentDevicesSectionProps) {
  const [devices, setDevices] = useState(initialDevices);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(initialDevices.length === 0);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const res = await fetch("/api/members/device", {
          method: "POST",
          credentials: "same-origin",
        });
        const data = (await res.json()) as { devices?: StudentDevice[] };
        if (!cancelled && Array.isArray(data.devices)) {
          setDevices(data.devices);
        }
      } catch {
        // Keep server-rendered list on failure.
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleRemove(deviceId: string) {
    const removed = devices.find((device) => device.id === deviceId);
    setRemovingId(deviceId);
    setStatus("");
    try {
      const res = await fetch("/api/members/device", {
        method: "DELETE",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId }),
      });
      if (!res.ok) throw new Error("remove failed");
      setDevices((current) => current.filter((device) => device.id !== deviceId));
      if (removed?.isCurrent) {
        window.location.href = `/api/members/device/retry?locale=${urlLocale}`;
      }
    } catch {
      setStatus(labels.removeFailed);
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <StudentGlassCard>
      <div className="mb-5 inline-flex h-11 w-11 items-center justify-center border border-orange/40 bg-orange/10">
        <MonitorSmartphone
          className="h-5 w-5 text-orange"
          strokeWidth={1.75}
          aria-hidden
        />
      </div>
      <h2 className="student-section-title">{labels.sectionTitle}</h2>
      <p className="mt-2 max-w-2xl font-dm text-sm leading-relaxed text-cream/55">
        {labels.sectionSubtitle}
      </p>
      {softMode ? (
        <p className="mt-3 rounded-lg border border-orange/25 bg-orange/10 px-3 py-2 font-dm text-xs leading-relaxed text-orange/90">
          {labels.softModeNote}
        </p>
      ) : null}

      {loading ? (
        <p className="mt-4 font-dm text-sm text-cream/55">{labels.loading}</p>
      ) : devices.length === 0 ? (
        <p className="mt-4 font-dm text-sm text-cream/55">{labels.noDevices}</p>
      ) : (
        <ul className="mt-5 space-y-3">
          {devices.map((device) => (
            <li
              key={device.id}
              className="flex flex-col gap-3 border border-white/[0.08] bg-white/[0.03] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="font-dm text-sm font-medium text-cream">{device.label}</p>
                <p className="mt-1 font-dm text-xs text-cream/50">
                  {labels.lastSeen}:{" "}
                  <span suppressHydrationWarning>
                    {formatDateOnly(device.lastSeenAt, dateLocale)}
                  </span>
                  {device.isCurrent ? (
                    <span className="ml-2 font-mono text-[10px] uppercase tracking-wider text-orange">
                      {labels.currentDevice}
                    </span>
                  ) : null}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void handleRemove(device.id)}
                disabled={removingId === device.id}
                className="shrink-0 border border-white/[0.12] px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-cream/70 transition-colors hover:border-orange/40 hover:text-orange disabled:cursor-not-allowed disabled:opacity-50"
              >
                {removingId === device.id ? labels.removing : labels.remove}
              </button>
            </li>
          ))}
        </ul>
      )}

      {status ? (
        <p className="mt-3 font-dm text-sm text-orange" role="status">
          {status}
        </p>
      ) : null}
    </StudentGlassCard>
  );
}
