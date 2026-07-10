import "server-only";

import { Prisma } from "@prisma/client";

import type { CrmActor } from "@/server/crm/access";

type CrmAuditLogInput = {
  action: string;
  actor: CrmActor;
  entityId: string;
  entityType: string;
  metadata?: Record<string, unknown>;
  organizationId?: string | null;
};

export async function createCrmAuditLog(tx: Prisma.TransactionClient, input: CrmAuditLogInput) {
  return tx.auditLog.create({
    data: {
      action: input.action,
      entityId: input.entityId,
      entityType: input.entityType,
      metadata: sanitizeMetadata(input.metadata ?? {}),
      organizationId: input.organizationId ?? undefined,
      userId: input.actor.id,
    },
  });
}

function sanitizeMetadata(value: Record<string, unknown>) {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonObject;
}
