import { NextResponse } from "next/server";
import {
  STUDENT_DEVICE_COOKIE,
  studentDeviceCookieOptions,
} from "@/lib/members/device";
import { deviceBootstrapUrl } from "@/lib/members/device-session";
import { learnPath } from "@/lib/members/paths";
import { isValidLocale, type UrlLocale } from "@/lib/i18n/config";
import { getStudentUser } from "@/lib/supabase/require-student";

function safeNextPath(value: string | null, locale: UrlLocale): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return learnPath(locale);
  }
  return value;
}

/** Clears the device cookie and sends the student through bootstrap again. */
export async function GET(request: Request) {
  const student = await getStudentUser();
  if (!student) {
    return NextResponse.redirect(new URL("/en/account/login", request.url));
  }

  const params = new URL(request.url).searchParams;
  const localeParam = params.get("locale") ?? "en";
  const locale: UrlLocale = isValidLocale(localeParam) ? localeParam : "en";
  const nextPath = safeNextPath(params.get("next"), locale);

  const response = NextResponse.redirect(
    new URL(deviceBootstrapUrl(locale, nextPath), request.url)
  );
  response.cookies.set(STUDENT_DEVICE_COOKIE, "", {
    ...studentDeviceCookieOptions(),
    maxAge: 0,
  });
  return response;
}
