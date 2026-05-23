import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { getCountryName } from "@/lib/countries";
import { courseSlugs } from "@/lib/courses";
import type { WaitlistSubmission } from "@/lib/courses/types";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "waitlist-submissions.json");

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function appendSubmission(entry: WaitlistSubmission) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  let existing: WaitlistSubmission[] = [];
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    existing = JSON.parse(raw) as WaitlistSubmission[];
  } catch {
    existing = [];
  }
  existing.push(entry);
  await fs.writeFile(DATA_FILE, JSON.stringify(existing, null, 2), "utf-8");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const courseSlug = String(body.courseSlug ?? "").trim();
    const fullName = String(body.fullName ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const mobile = String(body.mobile ?? "").trim();
    const country = String(body.country ?? "").trim();
    const locale = String(body.locale ?? "EN").trim();

    if (!courseSlug || !courseSlugs.includes(courseSlug)) {
      return NextResponse.json({ error: "Invalid course" }, { status: 400 });
    }
    if (fullName.length < 2) {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }
    if (mobile.length < 6) {
      return NextResponse.json({ error: "Invalid mobile" }, { status: 400 });
    }
    if (!getCountryName(country)) {
      return NextResponse.json({ error: "Invalid country" }, { status: 400 });
    }

    const entry: WaitlistSubmission = {
      courseSlug,
      fullName,
      email,
      mobile,
      country,
      locale,
      submittedAt: new Date().toISOString(),
    };

    await appendSubmission(entry);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
