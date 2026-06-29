import { cookies, headers } from "next/headers";
import {
  createDeviceToken,
  getStudentDeviceCapMax,
  hashDeviceToken,
  isStudentDeviceCapEnforced,
  isValidDeviceToken,
  STUDENT_DEVICE_COOKIE,
} from "@/lib/members/device";
import { touchStudentDevice } from "@/lib/members/device-store";

export interface StudentDeviceAccessResult {
  allowed: boolean;
  cap: number;
  needsBootstrap: boolean;
}

export function readStudentDeviceToken(): string | null {
  const token = cookies().get(STUDENT_DEVICE_COOKIE)?.value?.trim();
  if (!token || !isValidDeviceToken(token)) return null;
  return token;
}

export function readOrCreateStudentDeviceToken(): {
  token: string;
  isNew: boolean;
} {
  const existing = readStudentDeviceToken();
  if (existing) {
    return { token: existing, isNew: false };
  }
  return { token: createDeviceToken(), isNew: true };
}

/** Verify the current device cookie without creating one (use bootstrap API for that). */
export async function verifyStudentDeviceAccess(
  studentId: string
): Promise<StudentDeviceAccessResult> {
  const cap = getStudentDeviceCapMax();
  const token = readStudentDeviceToken();

  if (!token) {
    return {
      allowed: !isStudentDeviceCapEnforced(),
      cap,
      needsBootstrap: true,
    };
  }

  const result = await touchStudentDevice(
    studentId,
    token,
    headers().get("user-agent")
  );

  return {
    allowed: !result.blocked,
    cap: result.cap,
    needsBootstrap: false,
  };
}

export function getStudentDeviceTokenHash(): string | null {
  const token = readStudentDeviceToken();
  if (!token) return null;
  return hashDeviceToken(token);
}

export function deviceBootstrapUrl(locale: string, nextPath?: string): string {
  const params = new URLSearchParams({ locale });
  if (nextPath) params.set("next", nextPath);
  return `/api/members/device/bootstrap?${params.toString()}`;
}
