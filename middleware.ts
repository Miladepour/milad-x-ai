import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { defaultLocale, localePrefix } from "@/lib/i18n/config";
import { updateSession } from "@/lib/supabase/middleware";

/** Public marketing pages — skip Supabase session refresh to save server CPU. */
function isPublicMarketingPath(pathname: string): boolean {
  let path = pathname;
  if (path === "/fa" || path.startsWith("/fa/")) {
    path = path === "/fa" ? "/" : path.slice(3);
  }

  return (
    path === "/" ||
    path.startsWith("/blog") ||
    path.startsWith("/courses") ||
    path.startsWith("/free-ai-tutorials") ||
    path.startsWith("/certificates/verify") ||
    path.startsWith("/review") ||
    path.startsWith("/vip")
  );
}

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
  const { pathname } = request.nextUrl;
  const routingResponse = handleRequest(request);

  if (isPublicMarketingPath(pathname)) {
    return routingResponse;
  }

  // Route handlers call getStudentUser/getAdminUser themselves.
  if (pathname.startsWith("/api") || pathname.startsWith("/auth")) {
    return routingResponse;
  }

  return updateSession(request, routingResponse);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon|apple-icon|images|fonts|sitemap.xml|robots.txt).*)",
  ],
};
