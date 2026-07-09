import "server-only";

import { Prisma, type CrmActivityType } from "@prisma/client";

import type { CrmActor } from "@/server/crm/access";
import { getPrisma } from "@/server/db/prisma";

type ActivityInput = {
  leadId?: string | null;
  organizationId?: string | null;
  type: CrmActivityType;
  title: string;
  description?: string | null;
  metadata?: Record<string, unknown>;
};

export async function recordCrmActivity(input: ActivityInput, actor: CrmActor | null) {
  return createActivity(getPrisma(), input, actor);
}

export async function createActivity(
  client: Prisma.TransactionClient | ReturnType<typeof getPrisma>,
  input: ActivityInput,
  actor: CrmActor | null,
) {
  return client.crmActivity.create({
    data: {
      leadId: input.leadId ?? undefined,
      organizationId: input.organizationId ?? undefined,
      actorId: actor?.id,
      type: input.type,
      title: input.title,
      description: input.description ?? undefined,
      metadata: input.metadata ? safeJson(input.metadata) : undefined,
    },
  });
}

export async function writeCrmAudit(
  client: Prisma.TransactionClient | ReturnType<typeof getPrisma>,
  actor: CrmActor,
  action: string,
  entityType: string,
  entityId: string,
  metadata: Record<string, unknown>,
  organizationId?: string | null,
) {
  return client.auditLog.create({
    data: {
      userId: actor.id,
      organizationId: organizationId ?? undefined,
      action,
      entityType,
      entityId,
      metadata: safeJson(metadata),
    },
  });
}

export function safeJson(value: Record<string, unknown>) {
  const allowed = Object.fromEntries(
    Object.entries(value).filter(([key, entry]) => {
      if (/secret|token|password|payload|body|storage|key/i.test(key)) return false;
      if (entry === null) return true;
      if (["string", "number", "boolean"].includes(typeof entry)) return true;
      if (Array.isArray(entry)) return entry.every((item) => ["string", "number", "boolean"].includes(typeof item));
      return false;
    }),
  );
  return JSON.parse(JSON.stringify(allowed)) as Prisma.InputJsonObject;
}
