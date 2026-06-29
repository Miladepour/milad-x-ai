import { NextResponse } from "next/server";
import { headers } from "next/headers";
import {
  STUDENT_DEVICE_COOKIE,
  studentDeviceCookieOptions,
} from "@/lib/members/device";
import { touchStudentDevice } from "@/lib/members/device-store";
import {
  readOrCreateStudentDeviceToken,
} from "@/lib/members/device-session";
import { learnPath } from "@/lib/members/paths";
import { isValidLocale, type UrlLocale } from "@/lib/i18n/config";
import { getStudentUser } from "@/lib/supabase/require-student";

function safeNextPath(value: string | null, locale: UrlLocale): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return learnPath(locale);
  }
  return value;
}

/** Reuses the device cookie when present, registers the browser, redirects back. */
export async function GET(request: Request) {
  const student = await getStudentUser();
  if (!student) {
    return NextResponse.redirect(new URL("/en/account/login", request.url));
  }

  const params = new URL(request.url).searchParams;
  const localeParam = params.get("locale") ?? "en";
  const locale: UrlLocale = isValidLocale(localeParam) ? localeParam : "en";
  const nextPath = safeNextPath(params.get("next"), locale);

  const { token, isNew } = readOrCreateStudentDeviceToken();
  const userAgent = headers().get("user-agent");
  await touchStudentDevice(student.user.id, token, userAgent);

  const response = NextResponse.redirect(new URL(nextPath, request.url));
  if (isNew) {
    response.cookies.set(STUDENT_DEVICE_COOKIE, token, studentDeviceCookieOptions());
  }
  return response;
}
