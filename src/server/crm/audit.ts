import "server-only";

import { Prisma } from "@prisma/client";

import type { CrmActor } from "@/server/crm/permissions";
import { getPrisma } from "@/server/db/prisma";

type AuditClient = Prisma.TransactionClient | ReturnType<typeof getPrisma>;

export async function writeCrmAudit(
  input: {
    action: string;
    actor: CrmActor;
    description?: string;
    entityId: string;
    entityType: string;
    metadata?: unknown;
    organizationId?: string | null;
  },
  client: AuditClient = getPrisma(),
) {
  const metadata = toJsonObject(input.metadata ?? {});

  await client.auditLog.create({
    data: {
      action: input.action,
      entityId: input.entityId,
      entityType: input.entityType,
      metadata,
      organizationId: input.organizationId ?? null,
      userId: input.actor.id,
    },
  });

  await client.crmActivity.create({
    data: {
      action: input.action,
      actorId: input.actor.id,
      description: input.description ?? null,
      entityId: input.entityId,
      entityType: input.entityType,
      metadata,
      organizationId: input.organizationId ?? null,
      type: "SYSTEM",
    },
  });
}

function toJsonObject(value: unknown) {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonObject;
}
