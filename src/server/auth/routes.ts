import type { AppRole } from "@/server/auth/permissions";
import { STAFF_ROLES } from "@/server/auth/permissions";

export type RouteAccess = "public" | "staff" | "client" | "authenticated";

export type RoutePolicy = {
  access: RouteAccess;
  kind: "api" | "page";
  roles?: readonly AppRole[];
};

const publicRoutePatterns = [
  "/",
  "/blog",
  "/blog/:path*",
  "/sklep",
  "/sklep/:path*",
  "/login",
  "/api/auth/:path*",
  "/api/leads/iod",
  "/sitemap.xml",
  "/robots.txt",
] as const;

const staffRoutePatterns = [
  "/admin",
  "/admin/:path*",
  "/api/admin/:path*",
  "/api/crm/:path*",
] as const;

const clientRoutePatterns = [
  "/platforma",
  "/platforma/:path*",
  "/client",
  "/client/:path*",
] as const;

const authenticatedRoutePatterns = [
  "/dashboard",
  "/dashboard/:path*",
  "/documents",
  "/documents/:path*",
  "/uploads",
  "/uploads/:path*",
] as const;

export function getRoutePolicy(pathname: string): RoutePolicy {
  if (isStaticAssetPath(pathname) || matchesAny(pathname, publicRoutePatterns)) {
    return { access: "public", kind: routeKind(pathname) };
  }

  if (matchesAny(pathname, staffRoutePatterns)) {
    return { access: "staff", kind: routeKind(pathname), roles: STAFF_ROLES };
  }

  if (matchesAny(pathname, clientRoutePatterns)) {
    return { access: "client", kind: routeKind(pathname), roles: ["CLIENT"] as const };
  }

  if (matchesAny(pathname, authenticatedRoutePatterns)) {
    return { access: "authenticated", kind: routeKind(pathname) };
  }

  return { access: "public", kind: routeKind(pathname) };
}

export function isPublicRoute(pathname: string) {
  return getRoutePolicy(pathname).access === "public";
}

export function isPrivateRoute(pathname: string) {
  return !isPublicRoute(pathname);
}

export function normalizeCallbackUrl(value: string | null | undefined, fallback = "/admin") {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return fallback;
  return value;
}

export const routeAccessDocumentation = {
  authenticated: authenticatedRoutePatterns,
  client: clientRoutePatterns,
  public: publicRoutePatterns,
  staff: staffRoutePatterns,
};

function matchesAny(pathname: string, patterns: readonly string[]) {
  return patterns.some((pattern) => matchPattern(pathname, pattern));
}

function matchPattern(pathname: string, pattern: string) {
  if (pattern.endsWith("/:path*")) {
    const base = pattern.slice(0, -"/:path*".length);
    return pathname === base || pathname.startsWith(`${base}/`);
  }

  return pathname === pattern;
}

function routeKind(pathname: string): RoutePolicy["kind"] {
  return pathname.startsWith("/api/") ? "api" : "page";
}

function isStaticAssetPath(pathname: string) {
  return (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/assets/") ||
    pathname.startsWith("/brand/") ||
    pathname === "/favicon.svg" ||
    /\.[a-zA-Z0-9]+$/.test(pathname)
  );
}
