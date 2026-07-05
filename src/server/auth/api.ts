import "server-only";

import { NextResponse } from "next/server";
import { ForbiddenError, UnauthorizedError, logBlockedAccessAttempt, requireRole } from "@/server/auth/guards";
import type { AppRole } from "@/server/auth/roles";

type ApiGuardContext = {
  entityId: string;
  entityType: string;
  request: Request;
};

export async function requireApiRole(roles: readonly AppRole[], context: ApiGuardContext) {
  try {
    return await requireRole(roles);
  } catch (error) {
    if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
      await logBlockedAccessAttempt({
        entityId: context.entityId,
        entityType: context.entityType,
        metadata: {
          path: new URL(context.request.url).pathname,
          reason: error.name,
        },
        request: context.request,
      });
    }

    throw error;
  }
}

export function authErrorResponse(error: unknown) {
  if (error instanceof UnauthorizedError) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  if (error instanceof ForbiddenError) {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  return null;
}
