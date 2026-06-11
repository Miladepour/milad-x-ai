import { NextResponse } from "next/server";
import { validateStudentSelfUpdate } from "@/lib/members/profile-validation";
import { getStudentProfileAccount, updateStudentSelf } from "@/lib/members/store";
import { SERVER_ERROR_MESSAGE } from "@/lib/security/api-errors";
import { getStudentUser } from "@/lib/supabase/require-student";

export async function GET() {
  const student = await getStudentUser();
  if (!student) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const account = await getStudentProfileAccount(student.user.id);
    if (!account) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, account });
  } catch (error) {
    console.error("[members/profile GET]", error);
    return NextResponse.json({ error: SERVER_ERROR_MESSAGE }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const student = await getStudentUser();
  if (!student) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const action = String(body.action ?? "");

    if (action !== "update-profile") {
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    const validation = validateStudentSelfUpdate({
      fullName: body.fullName !== undefined ? String(body.fullName) : undefined,
      phone: body.phone !== undefined ? String(body.phone) : undefined,
      locale: body.locale !== undefined ? String(body.locale) : undefined,
    });

    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const profile = await updateStudentSelf(student.user.id, validation.data);

    return NextResponse.json({ ok: true, profile });
  } catch (error) {
    console.error("[members/profile POST]", error);
    return NextResponse.json({ error: SERVER_ERROR_MESSAGE }, { status: 500 });
  }
}
