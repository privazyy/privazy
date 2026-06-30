import "server-only";

import { Prisma } from "@prisma/client";
import { getPrisma } from "@/server/db/prisma";

type AuditLogInput = {
  action: string;
  entityId: string;
  entityType: string;
  metadata?: Prisma.InputJsonObject;
  organizationId?: string | null;
  request?: Request;
  userId?: string | null;
};

export function getRequestIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    undefined
  );
}

export function getRequestAuditMeta(request: Request) {
  return {
    ipAddress: getRequestIp(request),
    userAgent: request.headers.get("user-agent") ?? undefined,
  };
}

export async function logAuditEvent(input: AuditLogInput) {
  const requestMeta: { ipAddress?: string; userAgent?: string } = input.request ? getRequestAuditMeta(input.request) : {};

  await getPrisma().auditLog.create({
    data: {
      action: input.action,
      entityId: input.entityId,
      entityType: input.entityType,
      ipAddress: requestMeta.ipAddress,
      metadata: input.metadata ?? {},
      organizationId: input.organizationId ?? undefined,
      userAgent: requestMeta.userAgent,
      userId: input.userId ?? undefined,
    },
  });
}

export async function safeLogAuditEvent(input: AuditLogInput) {
  try {
    await logAuditEvent(input);
  } catch (error) {
    console.error("Audit log write failed", error);
  }
}
