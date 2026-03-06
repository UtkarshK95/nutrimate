import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect dashboard routes
  if (!pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  const cookie = request.cookies.get("site-password");
  const sitePassword = process.env.SITE_PASSWORD;

  if (!sitePassword || cookie?.value !== sitePassword) {
    const url = request.nextUrl.clone();
    url.pathname = "/enter-password";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
