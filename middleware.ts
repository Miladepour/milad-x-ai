import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { defaultLocale, localePrefix } from "@/lib/i18n/config";
import { updateSession } from "@/lib/supabase/middleware";

function handleRequest(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  if (
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

  if (pathname.startsWith("/api") || pathname.startsWith("/auth")) {
    return NextResponse.next();
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

export async function middleware(request: NextRequest) {
  const routingResponse = handleRequest(request);
  return updateSession(request, routingResponse);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon|apple-icon|images|fonts|sitemap.xml|robots.txt).*)",
  ],
};
