"use client";

import { FormEvent, useEffect, useState } from "react";
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

interface StudentProfilePanelProps {
  studentId: string;
  programs: MemberProgram[];
  membersRequest: (action: string, payload?: Record<string, unknown>) => Promise<unknown>;
  onClose: () => void;
  onStatus: (message: string) => void;
  onUpdated: () => Promise<void>;
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
}: StudentProfilePanelProps) {
  const [data, setData] = useState<StudentWithEnrollments | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
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
          <p className="font-mono text-[10px] uppercase tracking-widest text-orange/80">
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
                      {formatDateOnly(item.accessStartsAt)} →{" "}
                      {item.accessEndsAt ? formatDateOnly(item.accessEndsAt) : "No end date"}
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
                  <button
                    type="button"
                    onClick={() => startEditEnrollment(item)}
                    className="border border-surface px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-cream hover:border-orange"
                  >
                    Edit
                  </button>
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
    </div>
  );
}
