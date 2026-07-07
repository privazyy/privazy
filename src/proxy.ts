import { NextResponse } from "next/server";

import { auth } from "@/server/auth";
import { getForbiddenRedirectPath, roleCanAccess } from "@/server/auth/permissions";
import { getRoutePolicy } from "@/server/auth/routes";

export const proxy = auth((request) => {
  const { nextUrl } = request;
  const policy = getRoutePolicy(nextUrl.pathname);

  if (policy.access === "public") {
    return NextResponse.next();
  }

  const user = request.auth?.user;
  const role = user?.role;

  if (!user) {
    if (policy.kind === "api") {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", `${nextUrl.pathname}${nextUrl.search}`);

    return NextResponse.redirect(loginUrl);
  }

  if (policy.roles && !roleCanAccess(role, policy.roles)) {
    if (policy.kind === "api") {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    return NextResponse.redirect(new URL(getForbiddenRedirectPath(role), nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/documents/:path*",
    "/uploads/:path*",
    "/client/:path*",
    "/platforma/:path*",
    "/api/admin/:path*",
    "/api/crm/:path*",
  ],
};
