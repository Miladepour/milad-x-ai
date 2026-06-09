"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import StudentProfilePanel from "@/components/admin/StudentProfilePanel";
import { PAYMENT_CURRENCIES, formatPayment } from "@/lib/members/currency";
import { formatDateOnly, todayDateInputValue } from "@/lib/members/dates";
import type {
  EnrollmentWithDetails,
  MemberProgram,
  PaymentCurrency,
  StudentProfile,
} from "@/lib/members/types";

interface StudentManagerProps {
  membersRequest: (action: string, payload?: Record<string, unknown>) => Promise<unknown>;
  onStatus: (message: string) => void;
}

interface StudentGroup {
  profile: StudentProfile;
  enrollments: EnrollmentWithDetails[];
}

export default function StudentManager({ membersRequest, onStatus }: StudentManagerProps) {
  const [programs, setPrograms] = useState<MemberProgram[]>([]);
  const [enrollments, setEnrollments] = useState<EnrollmentWithDetails[]>([]);
  const [filterProgram, setFilterProgram] = useState("");
  const [search, setSearch] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [invite, setInvite] = useState({
    email: "",
    fullName: "",
    phone: "",
    notes: "",
    locale: "EN" as "EN" | "FA",
    programId: "",
    accessStartsAt: todayDateInputValue(),
    accessEndsAt: "",
    amountPaid: "",
    currency: "USD" as PaymentCurrency,
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

  const studentGroups = useMemo(() => {
    const map = new Map<string, StudentGroup>();
    for (const item of enrollments) {
      if (!item.student) continue;
      if (filterProgram && item.programId !== filterProgram) continue;
      const existing = map.get(item.student.id);
      if (existing) {
        existing.enrollments.push(item);
      } else {
        map.set(item.student.id, {
          profile: item.student,
          enrollments: [item],
        });
      }
    }
    return Array.from(map.values());
  }, [enrollments, filterProgram]);

  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return studentGroups;
    return studentGroups.filter(({ profile }) => {
      const haystack = [
        profile.fullName,
        profile.email,
        profile.phone ?? "",
        profile.notes ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [studentGroups, search]);

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
        phone: invite.phone.trim() || null,
        notes: invite.notes.trim() || null,
        locale: invite.locale,
        programId: invite.programId,
        accessStartsAt: invite.accessStartsAt,
        accessEndsAt: invite.accessEndsAt || null,
        amountPaid: invite.amountPaid ? Number(invite.amountPaid) : null,
        currency: invite.amountPaid ? invite.currency : null,
      });
      setInvite((i) => ({
        ...i,
        email: "",
        fullName: "",
        phone: "",
        notes: "",
        amountPaid: "",
      }));
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
    const y = base.getFullYear();
    const m = String(base.getMonth() + 1).padStart(2, "0");
    const d = String(base.getDate()).padStart(2, "0");
    try {
      await membersRequest("update-enrollment", {
        enrollmentId,
        status: "active",
        accessEndsAt: `${y}-${m}-${d}`,
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
        <input
          type="tel"
          value={invite.phone}
          onChange={(e) => setInvite((i) => ({ ...i, phone: e.target.value }))}
          className="form-field"
          placeholder="Phone"
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
              {p.title} {p.status === "draft" ? "(draft)" : ""}
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
            type="date"
            value={invite.accessStartsAt}
            onChange={(e) => setInvite((i) => ({ ...i, accessStartsAt: e.target.value }))}
            className="form-field"
            required
          />
        </label>
        <label className="flex flex-col gap-1 font-dm text-xs text-cream/70">
          Access ends (optional)
          <input
            type="date"
            value={invite.accessEndsAt}
            onChange={(e) => setInvite((i) => ({ ...i, accessEndsAt: e.target.value }))}
            className="form-field"
          />
        </label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={invite.amountPaid}
          onChange={(e) => setInvite((i) => ({ ...i, amountPaid: e.target.value }))}
          className="form-field"
          placeholder="Amount paid"
        />
        <select
          value={invite.currency}
          onChange={(e) =>
            setInvite((i) => ({
              ...i,
              currency: e.target.value as PaymentCurrency,
            }))
          }
          className="form-field"
        >
          {PAYMENT_CURRENCIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <textarea
          value={invite.notes}
          onChange={(e) => setInvite((i) => ({ ...i, notes: e.target.value }))}
          className="form-field min-h-[72px] resize-y md:col-span-2"
          placeholder="Notes (internal)"
        />
        <button
          type="submit"
          className="md:col-span-2 bg-orange px-5 py-3 font-mono text-xs uppercase tracking-widest text-background hover:bg-cream"
        >
          Send invite
        </button>
      </form>

      {selectedStudentId && (
        <StudentProfilePanel
          studentId={selectedStudentId}
          programs={programs}
          membersRequest={membersRequest}
          onClose={() => setSelectedStudentId(null)}
          onStatus={onStatus}
          onUpdated={load}
        />
      )}

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <p className="font-mono text-xs uppercase tracking-widest text-orange">
            Students ({filteredStudents.length})
          </p>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-field max-w-xs"
            placeholder="Search name, email, phone…"
          />
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

        {filteredStudents.length === 0 ? (
          <div className="border border-surface bg-surface/20 p-8 font-dm text-cream/70">
            No students found.
          </div>
        ) : (
          <ul className="divide-y divide-surface border border-surface">
            {filteredStudents.map(({ profile, enrollments: items }) => (
              <li key={profile.id} className="flex flex-col gap-3 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <button
                    type="button"
                    onClick={() => setSelectedStudentId(profile.id)}
                    className="text-start"
                  >
                    <p className="font-dm text-lg text-cream hover:text-orange">
                      {profile.fullName || profile.email}
                    </p>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-cream/50">
                      {profile.email}
                      {profile.phone ? ` · ${profile.phone}` : ""}
                    </p>
                    <p className="mt-1 font-dm text-xs text-cream/50">
                      {items.length} program{items.length === 1 ? "" : "s"} · Click to open profile
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedStudentId(profile.id)}
                    className="border border-orange px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-orange hover:bg-orange hover:text-background"
                  >
                    Open profile
                  </button>
                </div>

                <ul className="flex flex-col gap-2 border-s border-surface/80 ps-4">
                  {items.map((item) => (
                    <li
                      key={item.id}
                      className="flex flex-col gap-2 rounded-sm bg-surface/15 p-3 md:flex-row md:items-start md:justify-between"
                    >
                      <div>
                        <p className="font-dm text-sm text-cream">
                          {item.program?.title ?? item.programId}
                        </p>
                        <p className="font-mono text-[10px] uppercase tracking-widest text-cream/50">
                          {item.status} · {formatPayment(item.amountPaid, item.currency)}
                        </p>
                        <p className="font-dm text-xs text-cream/60">
                          {formatDateOnly(item.accessStartsAt)}
                          {item.accessEndsAt
                            ? ` → ${formatDateOnly(item.accessEndsAt)}`
                            : " → No end date"}
                        </p>
                        <p className="font-dm text-xs text-cream/50">
                          Progress: {item.completedLessons ?? 0}/{item.totalLessons ?? 0} (
                          {item.progressPercent ?? 0}%)
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
                      </div>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
