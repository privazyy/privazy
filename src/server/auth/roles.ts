import type { UserRole } from "@prisma/client";

export type AppRole = UserRole;

export const ADMIN_ROLES = ["ADMIN"] as const satisfies readonly AppRole[];
export const CRM_READ_ROLES = ["ADMIN", "LAWYER", "OPERATOR", "READ_ONLY"] as const satisfies readonly AppRole[];
export const CRM_WRITE_ROLES = ["ADMIN", "LAWYER", "OPERATOR"] as const satisfies readonly AppRole[];
export const DOCUMENT_READ_ROLES = ["ADMIN", "LAWYER", "OPERATOR", "READ_ONLY", "CLIENT"] as const satisfies readonly AppRole[];
export const DOCUMENT_GENERATION_ROLES = ["ADMIN", "LAWYER", "OPERATOR", "CLIENT"] as const satisfies readonly AppRole[];
export const PLATFORM_ROLES = ["ADMIN", "LAWYER", "OPERATOR", "READ_ONLY", "CLIENT"] as const satisfies readonly AppRole[];
export const ORDER_ROLES = ["ADMIN", "LAWYER", "OPERATOR"] as const satisfies readonly AppRole[];
export const PAYMENT_ROLES = ["ADMIN", "OPERATOR"] as const satisfies readonly AppRole[];

export type RoutePolicy = {
  kind: "api" | "page";
  roles: readonly AppRole[];
};

export function roleCanAccess(role: AppRole | undefined, allowedRoles: readonly AppRole[]) {
  return Boolean(role && allowedRoles.includes(role));
}

export function getPostLoginPath(role: AppRole | undefined) {
  if (role === "CLIENT") return "/platforma";
  return "/admin";
}

export function getForbiddenRedirectPath(role: AppRole | undefined) {
  if (role === "CLIENT") return "/platforma";
  return "/dashboard";
}

export function getRoutePolicy(pathname: string): RoutePolicy | null {
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return { kind: "page", roles: CRM_READ_ROLES };
  }

  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    return { kind: "page", roles: PLATFORM_ROLES };
  }

  if (pathname === "/documents" || pathname.startsWith("/documents/")) {
    return { kind: "page", roles: DOCUMENT_GENERATION_ROLES };
  }

  if (pathname === "/client" || pathname.startsWith("/client/")) {
    return { kind: "page", roles: PLATFORM_ROLES };
  }

  if (pathname === "/platforma" || pathname.startsWith("/platforma/")) {
    return { kind: "page", roles: PLATFORM_ROLES };
  }

  if (pathname.startsWith("/api/crm/")) {
    return { kind: "api", roles: CRM_READ_ROLES };
  }

  if (pathname.startsWith("/api/documents/")) {
    return { kind: "api", roles: DOCUMENT_GENERATION_ROLES };
  }

  if (pathname.startsWith("/api/orders/")) {
    return { kind: "api", roles: ORDER_ROLES };
  }

  if (pathname.startsWith("/api/payments/")) {
    return { kind: "api", roles: PAYMENT_ROLES };
  }

  if (pathname.startsWith("/api/platform/")) {
    return { kind: "api", roles: PLATFORM_ROLES };
  }

  return null;
}
