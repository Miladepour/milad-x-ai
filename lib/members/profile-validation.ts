import type { LocaleCode } from "@/lib/supabase/database.types";

const FULL_NAME_MIN = 2;
const FULL_NAME_MAX = 120;
const PHONE_MAX = 30;

export interface StudentSelfUpdateInput {
  fullName?: string;
  phone?: string | null;
  locale?: string;
}

export interface ValidatedStudentSelfUpdate {
  fullName?: string;
  phone?: string | null;
  locale?: LocaleCode;
}

export function validateStudentSelfUpdate(
  input: StudentSelfUpdateInput
): { ok: true; data: ValidatedStudentSelfUpdate } | { ok: false; error: string } {
  const data: ValidatedStudentSelfUpdate = {};

  if (input.fullName !== undefined) {
    const fullName = input.fullName.trim().replace(/\s+/g, " ");
    if (fullName.length < FULL_NAME_MIN) {
      return { ok: false, error: "Name must be at least 2 characters." };
    }
    if (fullName.length > FULL_NAME_MAX) {
      return { ok: false, error: "Name is too long." };
    }
    data.fullName = fullName;
  }

  if (input.phone !== undefined) {
    const phone = input.phone?.trim() ?? "";
    if (phone.length > PHONE_MAX) {
      return { ok: false, error: "Phone number is too long." };
    }
    data.phone = phone || null;
  }

  if (input.locale !== undefined) {
    if (input.locale !== "EN" && input.locale !== "FA") {
      return { ok: false, error: "Invalid language preference." };
    }
    data.locale = input.locale;
  }

  if (Object.keys(data).length === 0) {
    return { ok: false, error: "Nothing to update." };
  }

  return { ok: true, data };
}

export function validatePasswordChange(input: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): { ok: true } | { ok: false; error: string } {
  if (!input.currentPassword) {
    return { ok: false, error: "Current password is required." };
  }
  if (input.newPassword.length < 8) {
    return { ok: false, error: "New password must be at least 8 characters." };
  }
  if (input.newPassword !== input.confirmPassword) {
    return { ok: false, error: "New passwords do not match." };
  }
  if (input.currentPassword === input.newPassword) {
    return { ok: false, error: "New password must be different from the current password." };
  }
  return { ok: true };
}
