import { createHash, randomUUID } from "crypto";
import type { SerializeOptions } from "cookie";

export const STUDENT_DEVICE_COOKIE = "mxai_device";

const TOKEN_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Soft mode: register devices only. Set STUDENT_DEVICE_CAP_ENFORCE=true to block over cap. */
export function isStudentDeviceCapEnforced(): boolean {
  return process.env.STUDENT_DEVICE_CAP_ENFORCE === "true";
}

export function getStudentDeviceCapMax(): number {
  const raw = process.env.STUDENT_DEVICE_CAP_MAX?.trim();
  const parsed = raw ? Number.parseInt(raw, 10) : 2;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 2;
}

export function isValidDeviceToken(token: string): boolean {
  return TOKEN_RE.test(token);
}

export function hashDeviceToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function createDeviceToken(): string {
  return randomUUID();
}

export function studentDeviceCookieOptions(): SerializeOptions {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  };
}

export function formatDeviceLabel(userAgent: string | null | undefined): string {
  const ua = userAgent?.trim() ?? "";

  let browser = "Browser";
  if (ua.includes("DuckDuckGo")) browser = "DuckDuckGo";
  else if (ua.includes("Edg/")) browser = "Edge";
  else if (ua.includes("Firefox/")) browser = "Firefox";
  else if (ua.includes("Chrome/")) browser = "Chrome";
  else if (ua.includes("Safari/")) browser = "Safari";

  let os = "Device";
  if (ua.includes("iPhone")) os = "iPhone";
  else if (ua.includes("iPad")) os = "iPad";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("Mac OS X") || ua.includes("Macintosh")) os = "Mac";
  else if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Linux")) os = "Linux";

  return `${browser} on ${os}`;
}
