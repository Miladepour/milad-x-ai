import { NextResponse } from "next/server";
import { getBlogPosts } from "@/lib/blog/store";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const locale = url.searchParams.get("locale") === "FA" ? "FA" : "EN";
  const posts = await getBlogPosts(locale);

  return NextResponse.json({ posts });
}
