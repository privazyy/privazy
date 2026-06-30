import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { getForbiddenRedirectPath, getRoutePolicy, roleCanAccess } from "@/server/auth/roles";

export const proxy = auth((request) => {
  const { nextUrl } = request;
  const policy = getRoutePolicy(nextUrl.pathname);

  if (!policy) {
    return NextResponse.next();
  }

  const role = request.auth?.user?.role;

  if (!request.auth?.user) {
    if (policy.kind === "api") {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", `${nextUrl.pathname}${nextUrl.search}`);

    return NextResponse.redirect(loginUrl);
  }

  if (!roleCanAccess(role, policy.roles)) {
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
    "/client/:path*",
    "/platforma/:path*",
    "/api/crm/:path*",
    "/api/documents/:path*",
    "/api/orders/:path*",
    "/api/payments/:path*",
    "/api/platform/:path*",
  ],
};
