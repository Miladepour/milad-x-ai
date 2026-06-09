"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import type { EnrollmentWithDetails, MemberProgram } from "@/lib/members/types";

interface StudentManagerProps {
  membersRequest: (action: string, payload?: Record<string, unknown>) => Promise<unknown>;
  onStatus: (message: string) => void;
}

export default function StudentManager({ membersRequest, onStatus }: StudentManagerProps) {
  const [programs, setPrograms] = useState<MemberProgram[]>([]);
  const [enrollments, setEnrollments] = useState<EnrollmentWithDetails[]>([]);
  const [filterProgram, setFilterProgram] = useState("");
  const [invite, setInvite] = useState({
    email: "",
    fullName: "",
    locale: "EN" as "EN" | "FA",
    programId: "",
    accessStartsAt: new Date().toISOString().slice(0, 16),
    accessEndsAt: "",
  });

  const load = useCallback(async () => {
    const [programsData, enrollmentsData] = await Promise.all([
      membersRequest("list-programs") as Promise<{ programs: MemberProgram[] }>,
      membersRequest("list-enrollments") as Promise<{ enrollments: EnrollmentWithDetails[] }>,
    ]);
    setPrograms(programsData.programs ?? []);
    setEnrollments(enrollmentsData.enrollments ?? []);
  }, [membersRequest]);

  useEffect(() => {
    load().catch((e) =>
      onStatus(e instanceof Error ? e.message : "Could not load students")
    );
  }, [load, onStatus]);

  const filtered = useMemo(() => {
    if (!filterProgram) return enrollments;
    return enrollments.filter((e) => e.programId === filterProgram);
  }, [enrollments, filterProgram]);

  async function handleInvite(e: FormEvent) {
    e.preventDefault();
    if (!invite.email.trim() || !invite.programId) {
      onStatus("Email and program are required.");
      return;
    }
    onStatus("Sending invite…");
    try {
      await membersRequest("invite-student", {
        email: invite.email.trim(),
        fullName: invite.fullName.trim(),
        locale: invite.locale,
        programId: invite.programId,
        accessStartsAt: new Date(invite.accessStartsAt).toISOString(),
        accessEndsAt: invite.accessEndsAt
          ? new Date(invite.accessEndsAt).toISOString()
          : null,
      });
      setInvite((i) => ({ ...i, email: "", fullName: "" }));
      await load();
      onStatus("Invite sent.");
    } catch (err) {
      onStatus(err instanceof Error ? err.message : "Invite failed");
    }
  }

  async function updateStatus(
    enrollmentId: string,
    status: EnrollmentWithDetails["status"]
  ) {
    try {
      await membersRequest("update-enrollment", { enrollmentId, status });
      await load();
      onStatus(`Enrollment ${status}.`);
    } catch (err) {
      onStatus(err instanceof Error ? err.message : "Update failed");
    }
  }

  async function extendAccess(enrollmentId: string, days: number) {
    const item = enrollments.find((e) => e.id === enrollmentId);
    if (!item) return;
    const base = item.accessEndsAt ? new Date(item.accessEndsAt) : new Date();
    base.setDate(base.getDate() + days);
    try {
      await membersRequest("update-enrollment", {
        enrollmentId,
        status: "active",
        accessEndsAt: base.toISOString(),
      });
      await load();
      onStatus(`Access extended ${days} days.`);
    } catch (err) {
      onStatus(err instanceof Error ? err.message : "Extend failed");
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <form
        onSubmit={handleInvite}
        className="grid gap-4 border border-surface bg-surface/20 p-5 md:grid-cols-2"
      >
        <p className="md:col-span-2 font-mono text-xs uppercase tracking-widest text-orange">
          Invite student
        </p>
        <input
          value={invite.fullName}
          onChange={(e) => setInvite((i) => ({ ...i, fullName: e.target.value }))}
          className="form-field"
          placeholder="Full name"
        />
        <input
          type="email"
          value={invite.email}
          onChange={(e) => setInvite((i) => ({ ...i, email: e.target.value }))}
          className="form-field"
          placeholder="Email"
          required
        />
        <select
          value={invite.programId}
          onChange={(e) => setInvite((i) => ({ ...i, programId: e.target.value }))}
          className="form-field"
          required
        >
          <option value="">Select program</option>
          {programs.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
        <select
          value={invite.locale}
          onChange={(e) =>
            setInvite((i) => ({
              ...i,
              locale: e.target.value === "FA" ? "FA" : "EN",
            }))
          }
          className="form-field"
        >
          <option value="EN">English</option>
          <option value="FA">Farsi</option>
        </select>
        <label className="flex flex-col gap-1 font-dm text-xs text-cream/70">
          Access starts
          <input
            type="datetime-local"
            value={invite.accessStartsAt}
            onChange={(e) => setInvite((i) => ({ ...i, accessStartsAt: e.target.value }))}
            className="form-field"
          />
        </label>
        <label className="flex flex-col gap-1 font-dm text-xs text-cream/70">
          Access ends (optional)
          <input
            type="datetime-local"
            value={invite.accessEndsAt}
            onChange={(e) => setInvite((i) => ({ ...i, accessEndsAt: e.target.value }))}
            className="form-field"
          />
        </label>
        <button
          type="submit"
          className="md:col-span-2 bg-orange px-5 py-3 font-mono text-xs uppercase tracking-widest text-background hover:bg-cream"
        >
          Send invite
        </button>
      </form>

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <p className="font-mono text-xs uppercase tracking-widest text-orange">
            Enrollments ({filtered.length})
          </p>
          <select
            value={filterProgram}
            onChange={(e) => setFilterProgram(e.target.value)}
            className="form-field max-w-xs"
          >
            <option value="">All programs</option>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="border border-surface bg-surface/20 p-8 font-dm text-cream/70">
            No enrollments yet.
          </div>
        ) : (
          <ul className="divide-y divide-surface border border-surface">
            {filtered.map((item) => (
              <li key={item.id} className="flex flex-col gap-3 p-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="font-dm text-cream">
                    {item.student?.fullName || item.student?.email || "Unknown"}
                  </p>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-cream/50">
                    {item.student?.email} · {item.program?.title ?? item.programId} · {item.status}
                  </p>
                  <p className="mt-1 font-dm text-xs text-cream/60">
                    Progress: {item.completedLessons ?? 0}/{item.totalLessons ?? 0} (
                    {item.progressPercent ?? 0}%)
                  </p>
                  <p className="font-dm text-xs text-cream/50">
                    {item.accessStartsAt &&
                      `From ${new Date(item.accessStartsAt).toLocaleString()}`}
                    {item.accessEndsAt &&
                      ` · Until ${new Date(item.accessEndsAt).toLocaleString()}`}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => updateStatus(item.id, "active")}
                    className="border border-surface px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-cream hover:border-orange"
                  >
                    Activate
                  </button>
                  <button
                    type="button"
                    onClick={() => updateStatus(item.id, "suspended")}
                    className="border border-surface px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-cream hover:border-orange"
                  >
                    Suspend
                  </button>
                  <button
                    type="button"
                    onClick={() => extendAccess(item.id, 30)}
                    className="border border-surface px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-cream hover:border-orange"
                  >
                    +30 days
                  </button>
                  {item.accessEndsAt && (
                    <button
                      type="button"
                      onClick={() =>
                        membersRequest("send-expiry-reminder", {
                          enrollmentId: item.id,
                        }).then(() => onStatus("Reminder sent."))
                      }
                      className="border border-orange px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-orange hover:bg-orange hover:text-background"
                    >
                      Remind
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
