import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { classifyRoute } from "@/server/auth/route-policy";

const sessionCookieNames = ["authjs.session-token", "__Secure-authjs.session-token", "next-auth.session-token"];

export function proxy(request: NextRequest) {
  const access = classifyRoute(request.nextUrl.pathname);

  if (access === "public") {
    return NextResponse.next();
  }

  const hasSessionCookie = sessionCookieNames.some((name) => request.cookies.has(name));
  if (!hasSessionCookie) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/client/:path*", "/documents/:path*", "/platforma/:path*", "/uploads/:path*"],
};
