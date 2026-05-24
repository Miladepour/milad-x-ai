import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { defaultLocale, localePrefix } from "@/lib/i18n/config";

const ADMIN_ACCESS_HEADER = "x-milad-admin-access";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api") || pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  const adminSegment = process.env.ADMIN_PATH_SEGMENT;

  if (adminSegment && pathname === `/${adminSegment}`) {
    const headers = new Headers(request.headers);
    headers.set(ADMIN_ACCESS_HEADER, "1");
    return NextResponse.rewrite(new URL("/admin", request.url), {
      request: { headers },
    });
  }

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (request.headers.get(ADMIN_ACCESS_HEADER) !== "1") {
      return new NextResponse(null, { status: 404 });
    }
    return NextResponse.next();
  }

  // Legacy `/en/...` URLs → unprefixed English URLs
  if (pathname === `/${defaultLocale}` || pathname.startsWith(`/${defaultLocale}/`)) {
    const url = request.nextUrl.clone();
    url.pathname = pathname === `/${defaultLocale}` ? "/" : pathname.slice(3);
    return NextResponse.redirect(url, 301);
  }

  // Farsi: `/fa/...` served as-is
  if (pathname === `/${localePrefix}` || pathname.startsWith(`/${localePrefix}/`)) {
    return NextResponse.next();
  }

  // English default: rewrite internally to `/en/...` (URL stays unprefixed)
  const url = request.nextUrl.clone();
  url.pathname = pathname === "/" ? `/${defaultLocale}` : `/${defaultLocale}${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images|fonts).*)"],
};
