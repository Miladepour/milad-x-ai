import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { defaultLocale, localePrefix } from "@/lib/i18n/config";
import { updateSession } from "@/lib/supabase/middleware";

function handleRequest(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/_next") ||
    pathname === "/sitemap.xml" ||
    pathname === "/robots.txt" ||
    pathname === "/favicon.ico" ||
    pathname === "/icon" ||
    pathname.startsWith("/icon?") ||
    pathname === "/apple-icon" ||
    pathname.startsWith("/apple-icon?")
  ) {
    return NextResponse.next();
  }

  const adminSegment = process.env.ADMIN_PATH_SEGMENT;

  if (adminSegment && pathname === `/${adminSegment}`) {
    return NextResponse.rewrite(new URL("/admin", request.url));
  }

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return new NextResponse(null, { status: 404 });
  }

  if (pathname === `/${defaultLocale}` || pathname.startsWith(`/${defaultLocale}/`)) {
    const url = request.nextUrl.clone();
    url.pathname = pathname === `/${defaultLocale}` ? "/" : pathname.slice(3);
    return NextResponse.redirect(url, 301);
  }

  if (pathname === `/${localePrefix}` || pathname.startsWith(`/${localePrefix}/`)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = pathname === "/" ? `/${defaultLocale}` : `/${defaultLocale}${pathname}`;
  return NextResponse.rewrite(url);
}

function needsSessionRefresh(pathname: string): boolean {
  const logical = pathname.replace(/^\/fa/, "") || "/";
  const adminSegment = process.env.ADMIN_PATH_SEGMENT;
  if (adminSegment && logical === `/${adminSegment}`) return true;
  return (
    logical === "/admin" ||
    logical.startsWith("/admin/") ||
    logical.startsWith("/learn") ||
    logical.startsWith("/account") ||
    logical.startsWith("/auth")
  );
}

export async function middleware(request: NextRequest) {
  const response = handleRequest(request);
  if (!needsSessionRefresh(request.nextUrl.pathname)) {
    return response;
  }
  return updateSession(request, response);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon|apple-icon|images|fonts|sitemap.xml|robots.txt).*)",
  ],
};
