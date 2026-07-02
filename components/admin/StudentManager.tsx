"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import StudentAnnouncements from "@/components/admin/StudentAnnouncements";
import StudentEmailComposer from "@/components/admin/StudentEmailComposer";
import ExtendAccessModal from "@/components/admin/ExtendAccessModal";
import { AccountActivationBadge } from "@/components/admin/AccountActivationBadge";
import StudentProfilePanel from "@/components/admin/StudentProfilePanel";
import { getEnrollmentAccessBlockReason } from "@/lib/members/access";
import type { ExtendAccessMode } from "@/lib/members/extend-access";
import { computeExtendedEndDate } from "@/lib/members/extend-access";
import { PAYMENT_CURRENCIES, formatPayment } from "@/lib/members/currency";
import { formatDateOnly, todayDateInputValue } from "@/lib/members/dates";
import type {
  EnrollmentWithDetails,
  MemberProgram,
  PaymentCurrency,
  StudentInviteCheck,
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

type StudentSubTab = "announcements" | "invite" | "email" | "list";

type ExtendTarget =
  | {
      kind: "single";
      enrollment: EnrollmentWithDetails;
      studentName: string;
    }
  | {
      kind: "bulk";
      programId: string;
      programTitle: string;
      enrollments: EnrollmentWithDetails[];
    };

const SUB_TABS: { id: StudentSubTab; label: string }[] = [
  { id: "announcements", label: "Announcements" },
  { id: "email", label: "Email" },
  { id: "invite", label: "Invite" },
  { id: "list", label: "Student list" },
];

const STUDENTS_PAGE_SIZE = 10;

type ActivationFilter = "" | "activated" | "not_activated";

export default function StudentManager({ membersRequest, onStatus }: StudentManagerProps) {
  const [subTab, setSubTab] = useState<StudentSubTab>("list");
  const [programs, setPrograms] = useState<MemberProgram[]>([]);
  const [enrollments, setEnrollments] = useState<EnrollmentWithDetails[]>([]);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [filterProgram, setFilterProgram] = useState("");
  const [activationFilter, setActivationFilter] = useState<ActivationFilter>("");
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
  const [duplicatePrompt, setDuplicatePrompt] = useState<StudentInviteCheck | null>(null);
  const [emailCheck, setEmailCheck] = useState<StudentInviteCheck | null>(null);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [inviteSending, setInviteSending] = useState(false);
  const [extendTarget, setExtendTarget] = useState<ExtendTarget | null>(null);
  const [extendConfirming, setExtendConfirming] = useState(false);
  const [listPage, setListPage] = useState(1);

  const load = useCallback(async () => {
    const [programsData, enrollmentsData, studentsData] = await Promise.all([
      membersRequest("list-programs") as Promise<{ programs: MemberProgram[] }>,
      membersRequest("list-enrollments") as Promise<{ enrollments: EnrollmentWithDetails[] }>,
      membersRequest("list-students") as Promise<{ students: StudentProfile[] }>,
    ]);
    setPrograms(programsData.programs ?? []);
    setEnrollments(enrollmentsData.enrollments ?? []);
    setStudents(studentsData.students ?? []);
  }, [membersRequest]);

  useEffect(() => {
    load().catch((e) =>
      onStatus(e instanceof Error ? e.message : "Could not load students")
    );
  }, [load, onStatus]);

  useEffect(() => {
    const email = invite.email.trim();
    const programId = invite.programId;
    if (!email || !programId || !email.includes("@")) {
      setEmailCheck(null);
      setCheckingEmail(false);
      return;
    }

    setCheckingEmail(true);
    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          const result = (await membersRequest("check-student-invite", {
            email,
            programId,
          })) as { check: StudentInviteCheck };
          setEmailCheck(result.check);
        } catch {
          setEmailCheck(null);
        } finally {
          setCheckingEmail(false);
        }
      })();
    }, 400);

    return () => window.clearTimeout(timer);
  }, [invite.email, invite.programId, membersRequest]);

  useEffect(() => {
    setDuplicatePrompt(null);
  }, [invite.email, invite.programId]);

  useEffect(() => {
    setListPage(1);
  }, [search, filterProgram, activationFilter]);

  const enrollmentsByStudent = useMemo(() => {
    const map = new Map<string, EnrollmentWithDetails[]>();
    for (const item of enrollments) {
      if (!item.student) continue;
      const existing = map.get(item.student.id) ?? [];
      existing.push(item);
      map.set(item.student.id, existing);
    }
    return map;
  }, [enrollments]);

  const studentGroups = useMemo(() => {
    return students
      .map((profile) => {
        const items = enrollmentsByStudent.get(profile.id) ?? [];
        const visibleEnrollments = filterProgram
          ? items.filter((item) => item.programId === filterProgram)
          : items;
        return { profile, enrollments: visibleEnrollments };
      })
      .filter(({ enrollments: items }) => !filterProgram || items.length > 0);
  }, [students, enrollmentsByStudent, filterProgram]);

  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase();
    let result = studentGroups;

    if (activationFilter === "activated") {
      result = result.filter(({ profile }) => profile.accountActivated);
    } else if (activationFilter === "not_activated") {
      result = result.filter(({ profile }) => !profile.accountActivated);
    }

    if (!q) return result;
    return result.filter(({ profile }) => {
      const haystack = [
        profile.fullName,
        profile.email,
        profile.studentNumber,
        profile.phone ?? "",
        profile.notes ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [studentGroups, search, activationFilter]);

  const activatedStudentCount = useMemo(
    () => students.filter((profile) => profile.accountActivated).length,
    [students]
  );
  const notActivatedStudentCount = students.length - activatedStudentCount;

  const totalListPages = Math.max(1, Math.ceil(filteredStudents.length / STUDENTS_PAGE_SIZE));

  const paginatedStudents = useMemo(() => {
    const start = (listPage - 1) * STUDENTS_PAGE_SIZE;
    return filteredStudents.slice(start, start + STUDENTS_PAGE_SIZE);
  }, [filteredStudents, listPage]);

  useEffect(() => {
    if (listPage > totalListPages) {
      setListPage(totalListPages);
    }
  }, [listPage, totalListPages]);

  const listRangeStart =
    filteredStudents.length === 0 ? 0 : (listPage - 1) * STUDENTS_PAGE_SIZE + 1;
  const listRangeEnd = Math.min(listPage * STUDENTS_PAGE_SIZE, filteredStudents.length);

  const allStudents = students;

  function buildInvitePayload(allowExisting = false) {
    return {
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
      allowExisting,
    };
  }

  async function completeInviteSuccess(message: string) {
    setInvite((i) => ({
      ...i,
      email: "",
      fullName: "",
      phone: "",
      notes: "",
      amountPaid: "",
    }));
    setDuplicatePrompt(null);
    setEmailCheck(null);
    await load();
    onStatus(message);
    setSubTab("list");
  }

  async function sendInvite(allowExisting = false) {
    setInviteSending(true);
    try {
      await membersRequest("invite-student", buildInvitePayload(allowExisting));
      await completeInviteSuccess(
        allowExisting ? "Program added and invite sent." : "Invite sent."
      );
    } finally {
      setInviteSending(false);
    }
  }

  async function handleInvite(e: FormEvent) {
    e.preventDefault();
    if (!invite.email.trim() || !invite.programId) {
      onStatus("Email and program are required.");
      return;
    }

    onStatus("Checking email…");
    try {
      const result = (await membersRequest("check-student-invite", {
        email: invite.email.trim(),
        programId: invite.programId,
      })) as { check: StudentInviteCheck };

      if (!result.check.exists) {
        onStatus("Sending invite…");
        await sendInvite(false);
        return;
      }

      setDuplicatePrompt(result.check);
      onStatus(
        result.check.duplicateKind === "same_program"
          ? "This student is already enrolled in this program."
          : "A student with this email already exists."
      );
    } catch (err) {
      onStatus(err instanceof Error ? err.message : "Invite failed");
    }
  }

  async function confirmAddExistingStudent() {
    onStatus("Adding program and sending invite…");
    try {
      await sendInvite(true);
    } catch (err) {
      onStatus(err instanceof Error ? err.message : "Invite failed");
    }
  }

  async function confirmResendInvite() {
    if (!duplicatePrompt?.student) return;
    setInviteSending(true);
    onStatus("Sending invite…");
    try {
      await membersRequest("resend-student-invite", {
        studentId: duplicatePrompt.student.id,
        programId: invite.programId,
      });
      await completeInviteSuccess(`Invite resent to ${duplicatePrompt.student.email}.`);
    } catch (err) {
      onStatus(err instanceof Error ? err.message : "Could not resend invite");
    } finally {
      setInviteSending(false);
    }
  }

  async function updateStatus(
    enrollmentId: string,
    status: EnrollmentWithDetails["status"]
  ) {
    const item = enrollments.find((e) => e.id === enrollmentId);
    if (!item) return;

    const payload: Record<string, unknown> = { enrollmentId, status };
    if (status === "active") {
      const now = Date.now();
      if (new Date(item.accessStartsAt).getTime() > now) {
        payload.accessStartsAt = todayDateInputValue();
      }
      if (item.accessEndsAt && new Date(item.accessEndsAt).getTime() < now) {
        const end = new Date();
        end.setDate(end.getDate() + 30);
        const y = end.getFullYear();
        const m = String(end.getMonth() + 1).padStart(2, "0");
        const d = String(end.getDate()).padStart(2, "0");
        payload.accessEndsAt = `${y}-${m}-${d}`;
      }
    }

    try {
      await membersRequest("update-enrollment", payload);
      await load();
      onStatus(`Enrollment ${status}.`);
    } catch (err) {
      onStatus(err instanceof Error ? err.message : "Update failed");
    }
  }

  async function confirmExtendAccess(payload: {
    mode: ExtendAccessMode;
    days: number;
    endDate: string;
    enrollmentIds?: string[];
  }) {
    if (!extendTarget) return;
    setExtendConfirming(true);
    try {
      if (extendTarget.kind === "single") {
        const { enrollment } = extendTarget;
        const nextStatus = enrollment.status === "suspended" ? "suspended" : "active";
        const accessEndsAt = computeExtendedEndDate({
          mode: payload.mode,
          accessEndsAt: enrollment.accessEndsAt,
          days: payload.days,
          endDate: payload.endDate,
        });
        if (!accessEndsAt) {
          throw new Error("Could not compute the new end date.");
        }

        await membersRequest("update-enrollment", {
          enrollmentId: enrollment.id,
          status: nextStatus,
          accessEndsAt,
        });
        await load();
        onStatus(`Access extended for ${extendTarget.studentName}.`);
      } else {
        const result = (await membersRequest("bulk-extend-program", {
          programId: extendTarget.programId,
          mode: payload.mode,
          days: payload.mode === "days" ? payload.days : undefined,
          endDate: payload.mode === "date" ? payload.endDate : undefined,
          enrollmentIds: payload.enrollmentIds,
        })) as { updated: number; programTitle?: string };
        await load();
        onStatus(
          `Extended access for ${result.updated} student${
            result.updated === 1 ? "" : "s"
          } in ${result.programTitle ?? extendTarget.programTitle}.`
        );
      }
      setExtendTarget(null);
    } catch (err) {
      onStatus(err instanceof Error ? err.message : "Extend failed");
    } finally {
      setExtendConfirming(false);
    }
  }

  function openBulkExtend() {
    if (!filterProgram) {
      onStatus("Select a program first to extend all students in that program.");
      return;
    }
    const program = programs.find((item) => item.id === filterProgram);
    const programEnrollments = enrollments.filter(
      (item) => item.programId === filterProgram
    );
    if (programEnrollments.length === 0) {
      onStatus("No enrollments found for this program.");
      return;
    }
    setExtendTarget({
      kind: "bulk",
      programId: filterProgram,
      programTitle: program?.title ?? "Selected program",
      enrollments: programEnrollments,
    });
  }

  function pickInviteProgramId(items: EnrollmentWithDetails[]): string | null {
    if (items.length === 0) return null;
    if (filterProgram) {
      const match = items.find((item) => item.programId === filterProgram);
      if (match) return match.programId;
    }
    return items[0]?.programId ?? null;
  }

  async function resendInvite(
    profile: StudentProfile,
    items: EnrollmentWithDetails[]
  ) {
    const programId = pickInviteProgramId(items);
    if (!programId) {
      onStatus("This student has no program enrollment to include in the invite email.");
      return;
    }
    onStatus("Sending invite…");
    try {
      await membersRequest("resend-student-invite", {
        studentId: profile.id,
        programId,
      });
      onStatus(`Invite sent to ${profile.email}.`);
    } catch (err) {
      onStatus(err instanceof Error ? err.message : "Could not resend invite");
    }
  }

  async function deleteStudent(profile: StudentProfile) {
    const label = profile.fullName || profile.email;
    if (
      !confirm(
        `Delete "${label}" permanently?\n\nThis removes their account, enrollments, progress, and certificates. This cannot be undone.`
      )
    ) {
      return;
    }
    onStatus("Deleting student…");
    try {
      await membersRequest("delete-student", { studentId: profile.id });
      if (selectedStudentId === profile.id) {
        setSelectedStudentId(null);
      }
      await load();
      onStatus("Student deleted.");
    } catch (err) {
      onStatus(err instanceof Error ? err.message : "Could not delete student");
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap gap-2 border-b border-white/[0.08] pb-4">
        {SUB_TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSubTab(item.id)}
            className={`rounded-full px-4 py-2 font-mono text-[10px] uppercase tracking-widest transition-colors ${
              subTab === item.id
                ? "bg-orange text-background"
                : "border border-white/[0.1] text-cream/70 hover:border-orange hover:text-orange"
            }`}
          >
            {item.label}
            {item.id === "list" && students.length > 0 && (
              <span className="ms-1.5 opacity-80">({students.length})</span>
            )}
          </button>
        ))}
      </div>

      {subTab === "announcements" && (
        <StudentAnnouncements
          membersRequest={membersRequest}
          onStatus={onStatus}
          programs={programs}
          students={allStudents}
        />
      )}

      {subTab === "email" && (
        <StudentEmailComposer
          membersRequest={membersRequest}
          onStatus={onStatus}
          programs={programs}
          students={allStudents}
        />
      )}

      {subTab === "invite" && (
        <form onSubmit={handleInvite} className="grid gap-4 md:grid-cols-2">
          <p className="md:col-span-2 student-section-title">Invite a new student</p>
          <p className="md:col-span-2 font-dm text-sm text-cream/60">
            Sends a single invite email with a link to set their password and access the program.
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
          {(checkingEmail || emailCheck?.exists) && invite.email.trim() && invite.programId && (
            <p
              className={`md:col-span-2 font-dm text-sm ${
                emailCheck?.exists ? "text-amber-300/90" : "text-cream/50"
              }`}
            >
              {checkingEmail ? (
                "Checking email…"
              ) : emailCheck?.duplicateKind === "same_program" ? (
                `Existing student: ${emailCheck.student?.fullName || emailCheck.student?.email} is already enrolled in ${emailCheck.programTitle}.`
              ) : (
                `Existing student: ${emailCheck?.student?.fullName || emailCheck?.student?.email}${
                  emailCheck?.enrollments?.length
                    ? ` (${emailCheck.enrollments.length} program${
                        emailCheck.enrollments.length === 1 ? "" : "s"
                      } enrolled)`
                    : ""
                }. Confirm before adding to ${emailCheck?.programTitle ?? "this program"}.`
              )}
            </p>
          )}
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

          {duplicatePrompt?.exists && (
            <div className="md:col-span-2 flex flex-col gap-3 rounded-2xl border border-amber-400/30 bg-amber-400/5 p-4">
              <p className="font-mono text-[10px] uppercase tracking-widest text-amber-300">
                Duplicate email detected
              </p>
              <p className="font-dm text-sm text-cream">
                <strong className="text-cream">
                  {duplicatePrompt.student?.fullName || duplicatePrompt.student?.email}
                </strong>
                {duplicatePrompt.student?.studentNumber
                  ? ` (${duplicatePrompt.student.studentNumber})`
                  : ""}{" "}
                is already in your student list.
              </p>
              {duplicatePrompt.enrollments && duplicatePrompt.enrollments.length > 0 && (
                <ul className="font-dm text-xs text-cream/70">
                  {duplicatePrompt.enrollments.map((item) => (
                    <li key={item.id}>
                      {item.program?.title ?? item.programId}
                      {item.programId === invite.programId ? " (selected program)" : ""}
                    </li>
                  ))}
                </ul>
              )}
              <p className="font-dm text-sm text-cream/70">
                {duplicatePrompt.duplicateKind === "same_program"
                  ? `They are already enrolled in ${duplicatePrompt.programTitle}. You can resend the invite email or cancel.`
                  : `Add them to ${duplicatePrompt.programTitle} and send a new invite email, or cancel.`}
              </p>
              <div className="flex flex-wrap gap-2">
                {duplicatePrompt.duplicateKind === "same_program" ? (
                  <button
                    type="button"
                    onClick={() => void confirmResendInvite()}
                    disabled={inviteSending}
                    className="bg-orange px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-background hover:bg-cream disabled:opacity-50"
                  >
                    Resend invite
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => void confirmAddExistingStudent()}
                    disabled={inviteSending}
                    className="bg-orange px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-background hover:bg-cream disabled:opacity-50"
                  >
                    Add to program & send invite
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setDuplicatePrompt(null)}
                  className="border border-white/[0.12] px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-cream hover:border-orange"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={inviteSending}
            className="md:col-span-2 bg-orange px-5 py-3 font-mono text-xs uppercase tracking-widest text-background hover:bg-cream disabled:opacity-50"
          >
            {inviteSending ? "Sending…" : "Send invite"}
          </button>
        </form>
      )}

      {subTab === "list" && (
        <>
          {selectedStudentId && (
            <StudentProfilePanel
              studentId={selectedStudentId}
              programs={programs}
              membersRequest={membersRequest}
              onClose={() => setSelectedStudentId(null)}
              onStatus={onStatus}
              onUpdated={load}
              onDeleted={async () => {
                setSelectedStudentId(null);
                await load();
              }}
            />
          )}

          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3">
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
              <select
                value={activationFilter}
                onChange={(e) =>
                  setActivationFilter(e.target.value as ActivationFilter)
                }
                className="form-field max-w-xs"
              >
                <option value="">All accounts</option>
                <option value="activated">Activated only</option>
                <option value="not_activated">Not activated only</option>
              </select>
              <button
                type="button"
                onClick={openBulkExtend}
                disabled={!filterProgram}
                className="rounded-full border border-orange/50 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-orange hover:bg-orange hover:text-background disabled:cursor-not-allowed disabled:opacity-40"
              >
                Extend all in program
              </button>
            </div>

            <p className="font-dm text-sm text-cream/60">
              {filterProgram || search.trim() || activationFilter
                ? `${filteredStudents.length} of ${students.length} students`
                : `${students.length} students`}
              {filteredStudents.length > 0 &&
                ` · showing ${listRangeStart}–${listRangeEnd}`}
              {!filterProgram && !search.trim() && !activationFilter && (
                <>
                  {" "}
                  ·{" "}
                  <span className="text-emerald-300/90">
                    {activatedStudentCount} activated
                  </span>
                  {" · "}
                  <span className="text-red-300/90">
                    {notActivatedStudentCount} not activated
                  </span>
                </>
              )}
            </p>

            {filteredStudents.length === 0 ? (
              <div className="student-glass-pill p-8 font-dm text-cream/70">
                No students found.
              </div>
            ) : (
              <>
              <ul className="flex flex-col gap-3">
                {paginatedStudents.map(({ profile, enrollments: items }) => (
                  <li key={profile.id} className="student-glass-pill flex flex-col gap-3 p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <button
                        type="button"
                        onClick={() => setSelectedStudentId(profile.id)}
                        className="text-start"
                      >
                        <p className="font-dm text-lg text-cream hover:text-orange">
                          {profile.fullName || profile.email}
                        </p>
                        <div className="mt-1">
                          <AccountActivationBadge profile={profile} />
                        </div>
                        <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-cream/50">
                          {profile.studentNumber ? `${profile.studentNumber} · ` : ""}
                          {profile.email}
                          {profile.phone ? ` · ${profile.phone}` : ""}
                        </p>
                        <p className="mt-1 font-dm text-xs text-cream/50">
                          {items.length} program{items.length === 1 ? "" : "s"} · Click to open
                          profile
                        </p>
                      </button>
                      <div className="flex shrink-0 flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => resendInvite(profile, items)}
                          disabled={items.length === 0}
                          className="rounded-full border border-orange/50 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-orange hover:bg-orange hover:text-background disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Resend invite
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedStudentId(profile.id)}
                          className="rounded-full border border-orange/50 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-orange hover:bg-orange hover:text-background"
                        >
                          Open profile
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteStudent(profile)}
                          className="rounded-full border border-red-400/50 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-red-300 hover:border-red-300 hover:bg-red-400/10"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <ul className="flex flex-col gap-2 border-t border-white/[0.06] pt-3">
                      {items.length === 0 ? (
                        <li className="rounded-xl bg-white/[0.03] p-3 font-dm text-sm text-cream/55">
                          No program enrollments yet.
                        </li>
                      ) : (
                        items.map((item) => {
                        const accessBlock = getEnrollmentAccessBlockReason(item);
                        return (
                        <li
                          key={item.id}
                          className="flex flex-col gap-2 rounded-xl bg-white/[0.03] p-3 md:flex-row md:items-start md:justify-between"
                        >
                          <div>
                            <p className="font-dm text-sm text-cream">
                              {item.program?.title ?? item.programId}
                            </p>
                            <p className="font-mono text-[10px] uppercase tracking-widest text-cream/50">
                              {item.status} · {formatPayment(item.amountPaid, item.currency)}
                            </p>
                            <p className="font-dm text-xs text-cream/60">
                              Access: {formatDateOnly(item.accessStartsAt)}
                              {item.accessEndsAt
                                ? ` → expires ${formatDateOnly(item.accessEndsAt)}`
                                : " → no expiry"}
                            </p>
                            <p className="font-dm text-xs text-cream/50">
                              Progress: {item.completedLessons ?? 0}/{item.totalLessons ?? 0} (
                              {item.progressPercent ?? 0}%)
                            </p>
                            {accessBlock && (
                              <p className="mt-1 font-dm text-xs text-amber-300/90">
                                Student cannot open: {accessBlock}
                              </p>
                            )}
                            {!item.program?.slug?.trim() && (
                              <p className="mt-1 font-dm text-xs text-amber-300/90">
                                Program has no URL slug — edit the program and set an English slug.
                              </p>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => updateStatus(item.id, "active")}
                              className="rounded-full border border-white/[0.1] px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-cream hover:border-orange"
                            >
                              Activate
                            </button>
                            <button
                              type="button"
                              onClick={() => updateStatus(item.id, "suspended")}
                              className="rounded-full border border-white/[0.1] px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-cream hover:border-orange"
                            >
                              Suspend
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setExtendTarget({
                                  kind: "single",
                                  enrollment: item,
                                  studentName: profile.fullName || profile.email,
                                })
                              }
                              className="rounded-full border border-orange/40 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-orange hover:bg-orange hover:text-background"
                            >
                              Extend access
                            </button>
                          </div>
                        </li>
                        );
                        })
                      )}
                    </ul>
                  </li>
                ))}
              </ul>

              {totalListPages > 1 && (
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.08] pt-4">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-cream/50">
                    Page {listPage} of {totalListPages}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setListPage((page) => Math.max(1, page - 1))}
                      disabled={listPage <= 1}
                      className="rounded-full border border-white/[0.12] px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-cream hover:border-orange disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setListPage((page) => Math.min(totalListPages, page + 1))
                      }
                      disabled={listPage >= totalListPages}
                      className="rounded-full border border-white/[0.12] px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-cream hover:border-orange disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
              </>
            )}
          </div>

          <ExtendAccessModal
            open={extendTarget !== null}
            title={
              extendTarget?.kind === "bulk" ? "Extend program access" : "Extend student access"
            }
            programTitle={
              extendTarget?.kind === "bulk"
                ? extendTarget.programTitle
                : extendTarget?.enrollment.program?.title ?? "Program"
            }
            studentLabel={
              extendTarget?.kind === "single" ? extendTarget.studentName : undefined
            }
            currentEndsAt={
              extendTarget?.kind === "single"
                ? extendTarget.enrollment.accessEndsAt
                : null
            }
            previewRows={
              extendTarget?.kind === "bulk"
                ? extendTarget.enrollments.map((item) => ({
                    id: item.id,
                    label: item.student?.fullName || item.student?.email || "Student",
                    currentEndsAt: item.accessEndsAt,
                  }))
                : undefined
            }
            confirming={extendConfirming}
            onClose={() => {
              if (!extendConfirming) setExtendTarget(null);
            }}
            onConfirm={confirmExtendAccess}
          />
        </>
      )}
    </div>
  );
}
