import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import {
  createDeviceToken,
  hashDeviceToken,
  isStudentDeviceCapEnforced,
  isValidDeviceToken,
  STUDENT_DEVICE_COOKIE,
  studentDeviceCookieOptions,
} from "@/lib/members/device";
import {
  listStudentDevices,
  removeStudentDevice,
  touchStudentDevice,
} from "@/lib/members/device-store";
import { SERVER_ERROR_MESSAGE } from "@/lib/security/api-errors";
import { getStudentUser } from "@/lib/supabase/require-student";

function readOrCreateDeviceToken(): { token: string; isNew: boolean } {
  const cookieStore = cookies();
  const existing = cookieStore.get(STUDENT_DEVICE_COOKIE)?.value?.trim();
  if (existing && isValidDeviceToken(existing)) {
    return { token: existing, isNew: false };
  }

  const token = createDeviceToken();
  return { token, isNew: true };
}

function withDeviceCookie(response: NextResponse, token: string, isNew: boolean) {
  if (isNew) {
    response.cookies.set(STUDENT_DEVICE_COOKIE, token, studentDeviceCookieOptions());
  }
  return response;
}

export async function GET() {
  const student = await getStudentUser();
  if (!student) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const token = cookies().get(STUDENT_DEVICE_COOKIE)?.value?.trim();
    const currentHash =
      token && isValidDeviceToken(token) ? hashDeviceToken(token) : null;
    const devices = await listStudentDevices(student.user.id, currentHash);

    return NextResponse.json({
      ok: true,
      devices,
      softMode: !isStudentDeviceCapEnforced(),
    });
  } catch (error) {
    console.error("[members/device GET]", error);
    return NextResponse.json({ error: SERVER_ERROR_MESSAGE }, { status: 500 });
  }
}

export async function POST() {
  const student = await getStudentUser();
  if (!student) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { token, isNew } = readOrCreateDeviceToken();
    const userAgent = headers().get("user-agent");
    const result = await touchStudentDevice(student.user.id, token, userAgent);

    if (result.blocked) {
      return withDeviceCookie(
        NextResponse.json(
          {
            error: "Device limit reached",
            cap: result.cap,
            softMode: false,
            blocked: true,
          },
          { status: 403 }
        ),
        token,
        isNew
      );
    }

    const currentHash = hashDeviceToken(token);
    const devices = await listStudentDevices(student.user.id, currentHash);

    return withDeviceCookie(
      NextResponse.json({
        ok: true,
        device: result.device,
        devices,
        softMode: !isStudentDeviceCapEnforced(),
      }),
      token,
      isNew
    );
  } catch (error) {
    console.error("[members/device POST]", error);
    return NextResponse.json({ error: SERVER_ERROR_MESSAGE }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const student = await getStudentUser();
  if (!student) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const deviceId = String(body.deviceId ?? "").trim();
    if (!deviceId) {
      return NextResponse.json({ error: "deviceId required" }, { status: 400 });
    }

    await removeStudentDevice(student.user.id, deviceId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[members/device DELETE]", error);
    return NextResponse.json({ error: SERVER_ERROR_MESSAGE }, { status: 500 });
  }
}
