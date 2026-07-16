"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User } from "lucide-react";
import StudentGlassCard from "@/components/members/StudentGlassCard";
import StudentDevicesSection, {
  type StudentDevicesLabels,
} from "@/components/members/StudentDevicesSection";
import { formatPayment } from "@/lib/members/currency";
import { formatDateOnly } from "@/lib/members/dates";
import { validatePasswordChange } from "@/lib/members/profile-validation";
import type {
  EnrollmentStatus,
  StudentDevice,
  StudentProfile,
  StudentProfileEnrollmentSummary,
} from "@/lib/members/types";
import type { LocaleCode } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/client";

function profileInitials(fullName: string, email: string): string {
  const source = fullName.trim() || email.split("@")[0] || "?";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

export interface StudentProfileLabels {
  pageTitle: string;
  pageSubtitle: string;
  accountSection: string;
  enrollmentsSection: string;
  passwordSection: string;
  memberSince: string;
  studentId: string;
  emailLocked: string;
  fullName: string;
  email: string;
  phone: string;
  phoneOptional: string;
  languagePreference: string;
  saveChanges: string;
  saving: string;
  saved: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  updatePassword: string;
  updatingPassword: string;
  passwordUpdated: string;
  wrongPassword: string;
  saveFailed: string;
  fullNameLocked: string;
  noEnrollments: string;
  course: string;
  status: string;
  amountPaid: string;
  enrolledOn: string;
  accessUntil: string;
  noExpiry: string;
  statusActive: string;
  statusExpired: string;
  statusSuspended: string;
  statusInvited: string;
}

interface StudentProfilePageProps {
  initialProfile: StudentProfile;
  initialEnrollments: StudentProfileEnrollmentSummary[];
  initialDevices: StudentDevice[];
  hasActiveCertificate: boolean;
  softMode: boolean;
  deviceLabels: StudentDevicesLabels;
  dateLocale: "en-GB" | "fa-IR";
  urlLocale: "en" | "fa";
  labels: StudentProfileLabels;
}

function statusLabel(status: EnrollmentStatus, labels: StudentProfileLabels): string {
  switch (status) {
    case "active":
      return labels.statusActive;
    case "expired":
      return labels.statusExpired;
    case "suspended":
      return labels.statusSuspended;
    case "invited":
      return labels.statusInvited;
    default:
      return status;
  }
}

function statusClass(status: EnrollmentStatus): string {
  switch (status) {
    case "active":
      return "bg-emerald-500/15 text-emerald-300";
    case "expired":
      return "bg-white/[0.06] text-cream/55";
    case "suspended":
      return "bg-orange/15 text-orange";
    default:
      return "bg-white/[0.06] text-cream/55";
  }
}

export default function StudentProfilePage({
  initialProfile,
  initialEnrollments,
  initialDevices,
  hasActiveCertificate,
  softMode,
  deviceLabels,
  dateLocale,
  urlLocale,
  labels,
}: StudentProfilePageProps) {
  const router = useRouter();
  const [profile, setProfile] = useState(initialProfile);
  const [fullName, setFullName] = useState(initialProfile.fullName);
  const [phone, setPhone] = useState(initialProfile.phone ?? "");
  const [localePref, setLocalePref] = useState<LocaleCode>(initialProfile.locale);
  const [profileStatus, setProfileStatus] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);

  const initials = useMemo(
    () => profileInitials(profile.fullName, profile.email),
    [profile.fullName, profile.email]
  );

  async function handleProfileSubmit(e: FormEvent) {
    e.preventDefault();
    setProfileSaving(true);
    setProfileStatus("");

    try {
      const res = await fetch("/api/members/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          action: "update-profile",
          ...(hasActiveCertificate ? {} : { fullName }),
          phone,
          locale: localePref,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setProfileStatus(data.error || labels.saveFailed);
        return;
      }

      setProfile(data.profile);
      setFullName(data.profile.fullName);
      setPhone(data.profile.phone ?? "");
      setLocalePref(data.profile.locale);
      setProfileStatus(labels.saved);
      router.refresh();
    } catch {
      setProfileStatus(labels.saveFailed);
    } finally {
      setProfileSaving(false);
    }
  }

  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault();
    setPasswordStatus("");

    const validation = validatePasswordChange({
      currentPassword,
      newPassword,
      confirmPassword,
    });
    if (!validation.ok) {
      setPasswordStatus(validation.error);
      return;
    }

    setPasswordSaving(true);
    const supabase = createClient();

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: profile.email,
      password: currentPassword,
    });

    if (signInError) {
      setPasswordStatus(labels.wrongPassword);
      setPasswordSaving(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setPasswordStatus(error.message);
      setPasswordSaving(false);
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordStatus(labels.passwordUpdated);
    setPasswordSaving(false);
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-dm text-2xl font-semibold tracking-tight text-cream sm:text-3xl">
          {labels.pageTitle}
        </h1>
        <p className="mt-2 max-w-2xl font-dm text-sm leading-relaxed text-cream/55">
          {labels.pageSubtitle}
        </p>
      </header>

      <StudentGlassCard>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-orange/35 bg-orange/15 font-dm text-xl font-semibold text-orange"
            aria-hidden
          >
            {initials}
          </div>

          <form onSubmit={handleProfileSubmit} className="min-w-0 flex-1 space-y-4">
            <h2 className="student-section-title">{labels.accountSection}</h2>

            <label className="flex flex-col gap-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-cream/45">
                {labels.fullName}
              </span>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="form-field"
                autoComplete="name"
                required
                maxLength={120}
                readOnly={hasActiveCertificate}
                disabled={hasActiveCertificate}
                aria-describedby={
                  hasActiveCertificate ? "profile-fullname-locked-help" : undefined
                }
              />
              {hasActiveCertificate && (
                <p
                  id="profile-fullname-locked-help"
                  className="font-dm text-xs text-cream/45"
                >
                  {labels.fullNameLocked}
                </p>
              )}
            </label>

            <label className="flex flex-col gap-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-cream/45">
                {labels.studentId}
              </span>
              <input
                type="text"
                value={profile.studentNumber || "—"}
                className="form-field cursor-not-allowed font-mono tracking-wider opacity-70"
                readOnly
                disabled
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-cream/45">
                {labels.email}
              </span>
              <input
                type="email"
                value={profile.email}
                className="form-field cursor-not-allowed opacity-70"
                readOnly
                disabled
                aria-describedby="profile-email-help"
              />
              <p id="profile-email-help" className="font-dm text-xs text-cream/45">
                {labels.emailLocked}
              </p>
            </label>

            <label className="flex flex-col gap-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-cream/45">
                {labels.phone}{" "}
                <span className="normal-case tracking-normal text-cream/35">
                  ({labels.phoneOptional})
                </span>
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="form-field"
                autoComplete="tel"
                maxLength={30}
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-cream/45">
                {labels.languagePreference}
              </span>
              <select
                value={localePref}
                onChange={(e) => setLocalePref(e.target.value as LocaleCode)}
                className="form-field"
              >
                <option value="EN">English</option>
                <option value="FA">فارسی</option>
              </select>
            </label>

            <p className="font-dm text-xs text-cream/45">
              {labels.memberSince}{" "}
              {formatDateOnly(profile.createdAt, dateLocale)}
            </p>

            <button
              type="submit"
              disabled={profileSaving}
              className="inline-flex items-center gap-2 bg-orange px-5 py-3 font-mono text-xs uppercase tracking-widest text-background transition-colors hover:bg-cream disabled:cursor-not-allowed disabled:opacity-50"
            >
              <User className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              {profileSaving ? labels.saving : labels.saveChanges}
            </button>

            {profileStatus && (
              <p className="font-dm text-sm text-orange" role="status">
                {profileStatus}
              </p>
            )}
          </form>
        </div>
      </StudentGlassCard>

      <StudentGlassCard>
        <h2 className="student-section-title">{labels.enrollmentsSection}</h2>

        {initialEnrollments.length === 0 ? (
          <p className="mt-4 font-dm text-sm text-cream/55">{labels.noEnrollments}</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="border-b border-white/[0.08] font-mono text-[10px] uppercase tracking-widest text-cream/45">
                  <th className="px-3 py-3">{labels.course}</th>
                  <th className="px-3 py-3">{labels.status}</th>
                  <th className="px-3 py-3">{labels.amountPaid}</th>
                  <th className="px-3 py-3">{labels.enrolledOn}</th>
                  <th className="px-3 py-3">{labels.accessUntil}</th>
                </tr>
              </thead>
              <tbody>
                {initialEnrollments.map((enrollment) => (
                  <tr
                    key={enrollment.id}
                    className="border-b border-white/[0.05] font-dm text-sm text-cream/80"
                  >
                    <td className="px-3 py-3 font-medium text-cream">
                      {enrollment.programTitle}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider ${statusClass(enrollment.status)}`}
                      >
                        {statusLabel(enrollment.status, labels)}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      {formatPayment(enrollment.amountPaid, enrollment.currency)}
                    </td>
                    <td className="px-3 py-3">
                      {formatDateOnly(enrollment.enrolledAt, dateLocale)}
                    </td>
                    <td className="px-3 py-3">
                      {enrollment.accessEndsAt
                        ? formatDateOnly(enrollment.accessEndsAt, dateLocale)
                        : labels.noExpiry}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </StudentGlassCard>

      <StudentDevicesSection
        initialDevices={initialDevices}
        dateLocale={dateLocale}
        urlLocale={urlLocale}
        softMode={softMode}
        labels={deviceLabels}
      />

      <StudentGlassCard>
        <div className="mb-5 inline-flex h-11 w-11 items-center justify-center border border-orange/40 bg-orange/10">
          <Lock className="h-5 w-5 text-orange" strokeWidth={1.75} aria-hidden />
        </div>
        <h2 className="student-section-title">{labels.passwordSection}</h2>

        <form onSubmit={handlePasswordSubmit} className="mt-4 grid max-w-xl gap-4">
          <label className="flex flex-col gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-cream/45">
              {labels.currentPassword}
            </span>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="form-field"
              autoComplete="current-password"
              required
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-cream/45">
              {labels.newPassword}
            </span>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="form-field"
              autoComplete="new-password"
              required
              minLength={8}
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-cream/45">
              {labels.confirmPassword}
            </span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="form-field"
              autoComplete="new-password"
              required
            />
          </label>

          <button
            type="submit"
            disabled={passwordSaving}
            className="inline-flex w-full max-w-xs items-center justify-center gap-2 bg-orange px-5 py-3 font-mono text-xs uppercase tracking-widest text-background transition-colors hover:bg-cream disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {passwordSaving ? labels.updatingPassword : labels.updatePassword}
          </button>

          {passwordStatus && (
            <p className="font-dm text-sm text-orange" role="status">
              {passwordStatus}
            </p>
          )}
        </form>
      </StudentGlassCard>
    </div>
  );
}
