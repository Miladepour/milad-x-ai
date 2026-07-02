"use client";

import { FormEvent, useEffect, useState } from "react";
import ExtendAccessModal from "@/components/admin/ExtendAccessModal";
import { AccountActivationBadge } from "@/components/admin/AccountActivationBadge";
import type {
  EnrollmentWithDetails,
  MemberProgram,
  PaymentCurrency,
  StudentWithEnrollments,
} from "@/lib/members/types";
import { getEnrollmentAccessBlockReason } from "@/lib/members/access";
import { PAYMENT_CURRENCIES, formatPayment } from "@/lib/members/currency";
import {
  formatDateOnly,
  isoToDateInputValue,
  todayDateInputValue,
} from "@/lib/members/dates";
import type { ExtendAccessMode } from "@/lib/members/extend-access";
import { computeExtendedEndDate } from "@/lib/members/extend-access";

interface StudentProfilePanelProps {
  studentId: string;
  programs: MemberProgram[];
  membersRequest: (action: string, payload?: Record<string, unknown>) => Promise<unknown>;
  onClose: () => void;
  onStatus: (message: string) => void;
  onUpdated: () => Promise<void>;
  onDeleted?: () => void;
}

const emptyEnrollment = () => ({
  programId: "",
  accessStartsAt: todayDateInputValue(),
  accessEndsAt: "",
  amountPaid: "",
  currency: "USD" as PaymentCurrency,
});

export default function StudentProfilePanel({
  studentId,
  programs,
  membersRequest,
  onClose,
  onStatus,
  onUpdated,
  onDeleted,
}: StudentProfilePanelProps) {
  const [data, setData] = useState<StudentWithEnrollments | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [resendProgramId, setResendProgramId] = useState("");
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    locale: "EN" as "EN" | "FA",
    phone: "",
    notes: "",
  });
  const [addEnrollment, setAddEnrollment] = useState(emptyEnrollment());
  const [editingEnrollmentId, setEditingEnrollmentId] = useState<string | null>(null);
  const [enrollmentEdit, setEnrollmentEdit] = useState({
    accessStartsAt: "",
    accessEndsAt: "",
    amountPaid: "",
    currency: "USD" as PaymentCurrency,
    status: "active" as EnrollmentWithDetails["status"],
  });
  const [extendEnrollment, setExtendEnrollment] = useState<EnrollmentWithDetails | null>(
    null
  );
  const [extendConfirming, setExtendConfirming] = useState(false);

  async function load() {
    setLoading(true);
    setLoadError(null);
    try {
      const result = (await membersRequest("get-student", {
        studentId,
      })) as { student: StudentWithEnrollments };
      setData(result.student);
      setProfileForm({
        fullName: result.student.profile.fullName,
        locale: result.student.profile.locale,
        phone: result.student.profile.phone ?? "",
        notes: result.student.profile.notes ?? "",
      });
      setResendProgramId((current) => {
        if (current && result.student.enrollments.some((item) => item.programId === current)) {
          return current;
        }
        return result.student.enrollments[0]?.programId ?? "";
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not load student";
      setLoadError(message);
      setData(null);
      onStatus(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load().catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  async function handleSaveProfile(e: FormEvent) {
    e.preventDefault();
    onStatus("Saving profile…");
    try {
      await membersRequest("update-student", {
        studentId,
        fullName: profileForm.fullName,
        locale: profileForm.locale,
        phone: profileForm.phone,
        notes: profileForm.notes,
      });
      await load();
      await onUpdated();
      onStatus("Profile saved.");
    } catch (err) {
      onStatus(err instanceof Error ? err.message : "Save failed");
    }
  }

  async function handleAddEnrollment(e: FormEvent) {
    e.preventDefault();
    if (!addEnrollment.programId) {
      onStatus("Select a program.");
      return;
    }
    onStatus("Adding program…");
    try {
      await membersRequest("add-enrollment", {
        studentId,
        programId: addEnrollment.programId,
        accessStartsAt: addEnrollment.accessStartsAt,
        accessEndsAt: addEnrollment.accessEndsAt || null,
        amountPaid: addEnrollment.amountPaid
          ? Number(addEnrollment.amountPaid)
          : null,
        currency: addEnrollment.amountPaid ? addEnrollment.currency : null,
      });
      setAddEnrollment(emptyEnrollment());
      await load();
      await onUpdated();
      onStatus("Program added.");
    } catch (err) {
      onStatus(err instanceof Error ? err.message : "Could not add program");
    }
  }

  function startEditEnrollment(item: EnrollmentWithDetails) {
    setEditingEnrollmentId(item.id);
    setEnrollmentEdit({
      accessStartsAt: isoToDateInputValue(item.accessStartsAt),
      accessEndsAt: isoToDateInputValue(item.accessEndsAt),
      amountPaid: item.amountPaid != null ? String(item.amountPaid) : "",
      currency: item.currency ?? "USD",
      status: item.status,
    });
  }

  async function confirmExtendAccess(payload: {
    mode: ExtendAccessMode;
    days: number;
    endDate: string;
  }) {
    if (!extendEnrollment) return;
    setExtendConfirming(true);
    onStatus("Extending access…");
    try {
      const nextStatus =
        extendEnrollment.status === "suspended" ? "suspended" : "active";
      const accessEndsAt = computeExtendedEndDate({
        mode: payload.mode,
        accessEndsAt: extendEnrollment.accessEndsAt,
        days: payload.days,
        endDate: payload.endDate,
      });
      if (!accessEndsAt) {
        throw new Error("Could not compute the new end date.");
      }

      await membersRequest("update-enrollment", {
        enrollmentId: extendEnrollment.id,
        status: nextStatus,
        accessEndsAt,
      });
      setExtendEnrollment(null);
      await load();
      await onUpdated();
      onStatus("Access extended.");
    } catch (err) {
      onStatus(err instanceof Error ? err.message : "Extend failed");
    } finally {
      setExtendConfirming(false);
    }
  }

  async function saveEnrollmentEdit(enrollmentId: string) {
    onStatus("Saving enrollment…");
    try {
      await membersRequest("update-enrollment", {
        enrollmentId,
        status: enrollmentEdit.status,
        accessStartsAt: enrollmentEdit.accessStartsAt,
        accessEndsAt: enrollmentEdit.accessEndsAt || null,
        amountPaid: enrollmentEdit.amountPaid
          ? Number(enrollmentEdit.amountPaid)
          : null,
        currency: enrollmentEdit.amountPaid ? enrollmentEdit.currency : null,
      });
      setEditingEnrollmentId(null);
      await load();
      await onUpdated();
      onStatus("Enrollment updated.");
    } catch (err) {
      onStatus(err instanceof Error ? err.message : "Update failed");
    }
  }

  async function handleRemoveEnrollment(item: EnrollmentWithDetails) {
    const programTitle = item.program?.title ?? "this program";
    if (
      !confirm(
        `Remove "${programTitle}" from this student?\n\nThis deletes their enrollment, lesson progress, quiz attempts, and certificate for this program. The program itself is not deleted.`
      )
    ) {
      return;
    }
    onStatus("Removing program enrollment…");
    try {
      await membersRequest("delete-enrollment", { enrollmentId: item.id });
      if (editingEnrollmentId === item.id) {
        setEditingEnrollmentId(null);
      }
      await load();
      await onUpdated();
      onStatus("Program enrollment removed.");
    } catch (err) {
      onStatus(err instanceof Error ? err.message : "Could not remove enrollment");
    }
  }

  async function handleIssueCertificate(programId: string) {
    onStatus("Issuing certificate…");
    try {
      await membersRequest("issue-certificate", { studentId, programId });
      await load();
      onStatus("Certificate issued.");
    } catch (err) {
      onStatus(err instanceof Error ? err.message : "Could not issue certificate");
    }
  }

  async function handleClearDevices() {
    if (
      !confirm(
        "Clear all registered devices for this student?\n\nThey will need to sign in again on each browser. Use this if they are locked out by the device cap."
      )
    ) {
      return;
    }
    onStatus("Clearing devices…");
    try {
      await membersRequest("clear-student-devices", { studentId });
      await load();
      onStatus("All devices cleared.");
    } catch (err) {
      onStatus(err instanceof Error ? err.message : "Could not clear devices");
    }
  }

  async function handleRevokeCertificate(certificateId: string) {
    if (!confirm("Revoke this certificate? The student will no longer see it.")) return;
    onStatus("Revoking certificate…");
    try {
      await membersRequest("revoke-certificate", { certificateId });
      await load();
      onStatus("Certificate revoked.");
    } catch (err) {
      onStatus(err instanceof Error ? err.message : "Could not revoke certificate");
    }
  }

  async function handleResendInvite() {
    if (!data || data.enrollments.length === 0) {
      onStatus("Add a program enrollment before resending an invite.");
      return;
    }
    onStatus("Sending invite…");
    try {
      await membersRequest("resend-student-invite", {
        studentId,
        programId: resendProgramId || data.enrollments[0]?.programId,
      });
      onStatus("Invite email sent.");
    } catch (err) {
      onStatus(err instanceof Error ? err.message : "Could not resend invite");
    }
  }

  async function handleDeleteStudent() {
    if (!data) return;
    const label = data.profile.fullName || data.profile.email;
    if (
      !confirm(
        `Delete "${label}" permanently?\n\nThis removes their account, enrollments, progress, and certificates. This cannot be undone.`
      )
    ) {
      return;
    }
    onStatus("Deleting student…");
    try {
      await membersRequest("delete-student", { studentId });
      onStatus("Student deleted.");
      onDeleted?.();
    } catch (err) {
      onStatus(err instanceof Error ? err.message : "Could not delete student");
    }
  }

  if (loading) {
    return (
      <div className="border border-surface bg-surface/30 p-8 font-dm text-cream/70">
        Loading student…
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col gap-3 border border-surface bg-surface/30 p-8">
        <p className="font-dm text-cream/70">
          {loadError ?? "Could not load this student."}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="self-start font-mono text-xs uppercase tracking-widest text-orange hover:text-cream"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 border border-orange/30 bg-surface/30 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-orange">
            Student profile
          </p>
          <h3 className="mt-1 font-dm text-2xl font-semibold text-cream">
            {data.profile.fullName || data.profile.email}
          </h3>
          <div className="mt-2">
            <AccountActivationBadge profile={data.profile} />
          </div>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-orange/80">
            {data.profile.studentNumber || "No student ID"}
          </p>
          <p className="font-mono text-[10px] uppercase tracking-widest text-cream/50">
            {data.profile.email}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="font-mono text-xs uppercase tracking-widest text-cream/60 hover:text-orange"
        >
          Close
        </button>
      </div>

      <div className="flex flex-col gap-3 border border-white/[0.08] p-4">
        <p className="font-mono text-xs uppercase tracking-widest text-cream/50">
          Account actions
        </p>
        {data.enrollments.length > 1 && (
          <label className="grid max-w-md gap-1">
            <span className="font-mono text-[10px] uppercase tracking-widest text-cream/45">
              Program for invite email
            </span>
            <select
              value={resendProgramId}
              onChange={(e) => setResendProgramId(e.target.value)}
              className="form-field"
            >
              {data.enrollments.map((item) => (
                <option key={item.id} value={item.programId}>
                  {item.program?.title ?? item.programId}
                </option>
              ))}
            </select>
          </label>
        )}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleResendInvite}
            disabled={data.enrollments.length === 0}
            className="border border-orange px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-orange hover:bg-orange hover:text-background disabled:cursor-not-allowed disabled:opacity-50"
          >
            Resend invite
          </button>
          <button
            type="button"
            onClick={handleDeleteStudent}
            className="border border-red-400/60 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-red-300 hover:border-red-300 hover:bg-red-400/10"
          >
            Delete student
          </button>
        </div>
        <p className="font-dm text-xs text-cream/50">
          Resend invite sends a fresh password link. Delete removes the auth account and all
          student data permanently.
        </p>
      </div>

      <div className="border border-white/[0.08] p-4">
        <p className="font-mono text-xs uppercase tracking-widest text-cream/50">
          Registered devices ({data.devices.length})
        </p>
        <p className="mt-1 font-dm text-xs text-cream/45">
          When device cap is enabled in env, students over the limit are blocked at login.
        </p>
        {data.devices.length === 0 ? (
          <p className="mt-3 font-dm text-sm text-cream/55">No devices yet.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {data.devices.map((device) => (
              <li
                key={device.id}
                className="flex flex-wrap items-center justify-between gap-2 border border-white/[0.06] px-3 py-2"
              >
                <span className="font-dm text-sm text-cream">{device.label}</span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-cream/45">
                  Last seen {formatDateOnly(device.lastSeenAt, "en-GB")}
                </span>
              </li>
            ))}
          </ul>
        )}
        <button
          type="button"
          onClick={() => void handleClearDevices()}
          className="mt-3 border border-orange/50 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-orange hover:bg-orange hover:text-background"
        >
          Clear all devices
        </button>
      </div>

      <form onSubmit={handleSaveProfile} className="grid gap-4 md:grid-cols-2">
        <input
          value={data.profile.studentNumber}
          className="form-field cursor-not-allowed font-mono opacity-70"
          readOnly
          disabled
          aria-label="Student ID"
        />
        <input
          value={profileForm.fullName}
          onChange={(e) => setProfileForm((f) => ({ ...f, fullName: e.target.value }))}
          className="form-field"
          placeholder="Full name"
        />
        <input
          value={profileForm.phone}
          onChange={(e) => setProfileForm((f) => ({ ...f, phone: e.target.value }))}
          className="form-field"
          placeholder="Phone"
          type="tel"
        />
        <select
          value={profileForm.locale}
          onChange={(e) =>
            setProfileForm((f) => ({
              ...f,
              locale: e.target.value === "FA" ? "FA" : "EN",
            }))
          }
          className="form-field"
        >
          <option value="EN">English</option>
          <option value="FA">Farsi</option>
        </select>
        <div className="md:col-span-2">
          <textarea
            value={profileForm.notes}
            onChange={(e) => setProfileForm((f) => ({ ...f, notes: e.target.value }))}
            className="form-field min-h-[88px] resize-y"
            placeholder="Notes (internal)"
          />
        </div>
        <button
          type="submit"
          className="md:col-span-2 border border-orange px-5 py-2 font-mono text-xs uppercase tracking-widest text-orange hover:bg-orange hover:text-background"
        >
          Save profile
        </button>
      </form>

      <section className="flex flex-col gap-3">
        <p className="font-mono text-xs uppercase tracking-widest text-orange">
          Enrolled programs ({data.enrollments.length})
        </p>
        <ul className="divide-y divide-surface border border-surface">
          {data.enrollments.map((item) => (
            <li key={item.id} className="p-4">
              {editingEnrollmentId === item.id ? (
                <div className="grid gap-3 md:grid-cols-2">
                  <p className="md:col-span-2 font-dm text-cream">
                    {item.program?.title ?? item.programId}
                  </p>
                  <label className="flex flex-col gap-1 font-dm text-xs text-cream/70">
                    Access starts
                    <input
                      type="date"
                      value={enrollmentEdit.accessStartsAt}
                      onChange={(e) =>
                        setEnrollmentEdit((f) => ({
                          ...f,
                          accessStartsAt: e.target.value,
                        }))
                      }
                      className="form-field"
                    />
                  </label>
                  <label className="flex flex-col gap-1 font-dm text-xs text-cream/70">
                    Access ends
                    <input
                      type="date"
                      value={enrollmentEdit.accessEndsAt}
                      onChange={(e) =>
                        setEnrollmentEdit((f) => ({
                          ...f,
                          accessEndsAt: e.target.value,
                        }))
                      }
                      className="form-field"
                    />
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={enrollmentEdit.amountPaid}
                    onChange={(e) =>
                      setEnrollmentEdit((f) => ({ ...f, amountPaid: e.target.value }))
                    }
                    className="form-field"
                    placeholder="Amount paid"
                  />
                  <select
                    value={enrollmentEdit.currency}
                    onChange={(e) =>
                      setEnrollmentEdit((f) => ({
                        ...f,
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
                  <select
                    value={enrollmentEdit.status}
                    onChange={(e) =>
                      setEnrollmentEdit((f) => ({
                        ...f,
                        status: e.target.value as EnrollmentWithDetails["status"],
                      }))
                    }
                    className="form-field md:col-span-2"
                  >
                    <option value="active">Active</option>
                    <option value="invited">Invited</option>
                    <option value="suspended">Suspended</option>
                    <option value="expired">Expired</option>
                  </select>
                  <div className="flex gap-2 md:col-span-2">
                    <button
                      type="button"
                      onClick={() => saveEnrollmentEdit(item.id)}
                      className="bg-orange px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-background"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingEnrollmentId(null)}
                      className="border border-surface px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-cream"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="font-dm text-cream">{item.program?.title ?? item.programId}</p>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-cream/50">
                      {item.status} · {formatPayment(item.amountPaid, item.currency)}
                    </p>
                    <p className="font-dm text-xs text-cream/60">
                      Access: {formatDateOnly(item.accessStartsAt)} →{" "}
                      {item.accessEndsAt
                        ? `expires ${formatDateOnly(item.accessEndsAt)}`
                        : "no expiry"}
                    </p>
                    <p className="font-dm text-xs text-cream/50">
                      Progress: {item.completedLessons ?? 0}/{item.totalLessons ?? 0} (
                      {item.progressPercent ?? 0}%)
                    </p>
                    {getEnrollmentAccessBlockReason(item) && (
                      <p className="mt-1 font-dm text-xs text-amber-300/90">
                        Student cannot open: {getEnrollmentAccessBlockReason(item)}
                      </p>
                    )}
                    {!item.program?.slug?.trim() && (
                      <p className="mt-1 font-dm text-xs text-amber-300/90">
                        Program has no URL slug — set an English slug in Programs.
                      </p>
                    )}
                    {item.program?.certificateEnabled && (
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {data.certificatesByProgramId[item.programId] ? (
                          <>
                            <p className="font-mono text-[10px] uppercase tracking-widest text-emerald-400/90">
                              Certificate:{" "}
                              {data.certificatesByProgramId[item.programId].certificateNumber}
                            </p>
                            <button
                              type="button"
                              onClick={() =>
                                handleRevokeCertificate(
                                  data.certificatesByProgramId[item.programId].id
                                )
                              }
                              className="border border-surface px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-cream/70 hover:border-red-400 hover:text-red-300"
                            >
                              Revoke
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleIssueCertificate(item.programId)}
                            className="border border-orange px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-orange hover:bg-orange hover:text-background"
                          >
                            Issue certificate
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setExtendEnrollment(item)}
                      className="border border-orange/50 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-orange hover:bg-orange hover:text-background"
                    >
                      Extend access
                    </button>
                    <button
                      type="button"
                      onClick={() => startEditEnrollment(item)}
                      className="border border-surface px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-cream hover:border-orange"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveEnrollment(item)}
                      className="border border-red-500/40 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-red-300 hover:border-red-400 hover:text-red-200"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>

      <form
        onSubmit={handleAddEnrollment}
        className="grid gap-3 border border-dashed border-surface p-4 md:grid-cols-2"
      >
        <p className="md:col-span-2 font-mono text-xs uppercase tracking-widest text-cream/50">
          Add program
        </p>
        <select
          value={addEnrollment.programId}
          onChange={(e) => setAddEnrollment((f) => ({ ...f, programId: e.target.value }))}
          className="form-field md:col-span-2"
          required
        >
          <option value="">Select program</option>
          {programs.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
        <label className="flex flex-col gap-1 font-dm text-xs text-cream/70">
          Access starts
          <input
            type="date"
            value={addEnrollment.accessStartsAt}
            onChange={(e) =>
              setAddEnrollment((f) => ({ ...f, accessStartsAt: e.target.value }))
            }
            className="form-field"
            required
          />
        </label>
        <label className="flex flex-col gap-1 font-dm text-xs text-cream/70">
          Access ends (optional)
          <input
            type="date"
            value={addEnrollment.accessEndsAt}
            onChange={(e) =>
              setAddEnrollment((f) => ({ ...f, accessEndsAt: e.target.value }))
            }
            className="form-field"
          />
        </label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={addEnrollment.amountPaid}
          onChange={(e) =>
            setAddEnrollment((f) => ({ ...f, amountPaid: e.target.value }))
          }
          className="form-field"
          placeholder="Amount paid"
        />
        <select
          value={addEnrollment.currency}
          onChange={(e) =>
            setAddEnrollment((f) => ({
              ...f,
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
        <button
          type="submit"
          className="md:col-span-2 bg-orange px-5 py-2 font-mono text-xs uppercase tracking-widest text-background hover:bg-cream"
        >
          Add program to student
        </button>
      </form>

      <ExtendAccessModal
        open={extendEnrollment !== null}
        title="Extend student access"
        programTitle={extendEnrollment?.program?.title ?? "Program"}
        studentLabel={data.profile.fullName || data.profile.email}
        currentEndsAt={extendEnrollment?.accessEndsAt ?? null}
        confirming={extendConfirming}
        onClose={() => {
          if (!extendConfirming) setExtendEnrollment(null);
        }}
        onConfirm={confirmExtendAccess}
      />
    </div>
  );
}
