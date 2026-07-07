import { canAccessClientPortal, canAccessCrm, type AppActor } from "@/server/auth/permissions";

export type RouteAccess = "public" | "authenticated" | "staff" | "client_portal";

export type RouteDecision = {
  access: RouteAccess;
  allowed: boolean;
};

const exactPublicPaths = new Set(["/", "/blog", "/login", "/sklep/polityka-prywatnosci"]);
const publicPrefixes = ["/blog/", "/api/auth/", "/api/leads/iod"];
const staffPrefixes = ["/admin", "/api/crm"];
const clientPortalPrefixes = ["/platforma", "/client"];
const authenticatedPrefixes = ["/documents", "/uploads"];

export function classifyRoute(pathname: string): RouteAccess {
  const path = normalizePath(pathname);

  if (exactPublicPaths.has(path) || publicPrefixes.some((prefix) => path === prefix || path.startsWith(prefix))) {
    return "public";
  }

  if (staffPrefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) {
    return "staff";
  }

  if (clientPortalPrefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) {
    return "client_portal";
  }

  if (authenticatedPrefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) {
    return "authenticated";
  }

  return "public";
}

export function evaluateRouteAccess(pathname: string, actor: AppActor | null): RouteDecision {
  const access = classifyRoute(pathname);

  if (access === "public") return { access, allowed: true };
  if (!actor) return { access, allowed: false };
  if (access === "staff") return { access, allowed: canAccessCrm(actor) };
  if (access === "client_portal") return { access, allowed: canAccessClientPortal(actor) };

  return { access, allowed: true };
}

function normalizePath(pathname: string) {
  if (!pathname) return "/";
  const path = pathname.split("?")[0]?.replace(/\/+$/, "") || "/";
  return path === "" ? "/" : path;
}
