import "server-only";

import { Prisma, type PrismaClient } from "@prisma/client";

import type { CrmActor } from "@/server/crm/access";

type AuditClient = Prisma.TransactionClient | PrismaClient;

const blockedKeys = /(secret|token|password|payload|body|filekey|storagekey|privatekey|card|pan|cvv)/i;

export async function writeCrmAudit(
  client: AuditClient,
  actor: CrmActor,
  action: string,
  entityType: string,
  entityId: string,
  metadata: Record<string, unknown>,
  organizationId?: string | null,
) {
  await client.auditLog.create({
    data: {
      userId: actor.id,
      organizationId: organizationId ?? undefined,
      action,
      entityType,
      entityId,
      metadata: toSafeJson(metadata),
    },
  });
}

export function toSafeJson(value: Record<string, unknown>) {
  return JSON.parse(JSON.stringify(redact(value))) as Prisma.InputJsonObject;
}

function redact(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redact);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([key]) => !blockedKeys.test(key))
      .map(([key, nested]) => [key, redact(nested)]),
  );
}
