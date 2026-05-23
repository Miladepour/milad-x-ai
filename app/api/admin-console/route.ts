import { promises as fs } from "fs";
import path from "path";
import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { upsertBlogPost } from "@/lib/blog/store";
import type { BlogPost } from "@/lib/blog/types";
import type { ContactSubmission } from "@/lib/contact/types";
import type { WaitlistSubmission } from "@/lib/courses/types";

const DATA_DIR = path.join(process.cwd(), "data");
const CONTACT_FILE = path.join(DATA_DIR, "contact-submissions.json");
const WAITLIST_FILE = path.join(DATA_DIR, "waitlist-submissions.json");
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "";

function safeCompare(value: string, expected: string): boolean {
  if (!value || !expected) return false;
  const valueBuffer = Buffer.from(value);
  const expectedBuffer = Buffer.from(expected);

  if (valueBuffer.length !== expectedBuffer.length) return false;
  return timingSafeEqual(valueBuffer, expectedBuffer);
}

function isAuthorized(request: Request): boolean {
  return safeCompare(request.headers.get("x-admin-password") ?? "", ADMIN_PASSWORD);
}

async function readJsonFile<T>(file: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await fs.readFile(file, "utf-8")) as T;
  } catch {
    return fallback;
  }
}

export async function POST(request: Request) {
  if (!ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: "Admin password is not configured" },
      { status: 503 }
    );
  }

  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const action = String(body.action ?? "");

    if (action === "summary" || action === "login") {
      const [contactSubmissions, waitlistSubmissions] = await Promise.all([
        readJsonFile<ContactSubmission[]>(CONTACT_FILE, []),
        readJsonFile<WaitlistSubmission[]>(WAITLIST_FILE, []),
      ]);

      return NextResponse.json({
        ok: true,
        contactSubmissions: contactSubmissions.reverse(),
        waitlistSubmissions: waitlistSubmissions.reverse(),
      });
    }

    if (action === "publish-post") {
      const locale = body.locale === "FA" ? "FA" : "EN";
      const post: BlogPost = await upsertBlogPost({
        locale,
        title: String(body.title ?? ""),
        slug: String(body.slug ?? ""),
        excerpt: String(body.excerpt ?? ""),
        content: String(body.content ?? ""),
        date: String(body.date ?? ""),
        publishedAt: String(body.publishedAt ?? ""),
      });

      return NextResponse.json({ ok: true, post });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
