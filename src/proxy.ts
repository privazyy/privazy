import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { auth } from "@/server/auth";

export default auth((request: NextRequest & { auth: { user?: { role?: string } } | null }) => {
  const role = request.auth?.user?.role;
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/admin")) {
    const target = request.nextUrl.clone();
    target.pathname = pathname.replace(/^\/admin/, "/crm") || "/crm";
    return NextResponse.redirect(target, 308);
  }

  if (!request.auth?.user) {
    const login = new URL("/login", request.nextUrl);
    login.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(login);
  }

  if (role === "CLIENT") {
    return NextResponse.redirect(new URL("/client", request.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/crm/:path*"],
};
