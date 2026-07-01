import "server-only";

import { Prisma } from "@prisma/client";

import type { PlatformActor } from "@/server/platform/permissions";
import { getPrisma } from "@/server/db/prisma";

type PlatformAuditClient = Prisma.TransactionClient | ReturnType<typeof getPrisma>;

export async function writePlatformEvent(
  input: {
    action: string;
    actor: PlatformActor;
    body?: string;
    entityId: string;
    entityType: string;
    metadata?: unknown;
    organizationId: string;
    timelineTitle: string;
    type:
      | "BREACH_CREATED"
      | "REQUEST_CREATED"
      | "DOCUMENT_FORM_SUBMITTED"
      | "DOCUMENT_DOWNLOADED"
      | "MESSAGE_SENT"
      | "TASK_COMPLETED"
      | "ORGANIZATION_UPDATED"
      | "SYSTEM";
  },
  client: PlatformAuditClient = getPrisma(),
) {
  const metadata = toJsonObject(input.metadata ?? {});

  await client.auditLog.create({
    data: {
      action: input.action,
      entityId: input.entityId,
      entityType: input.entityType,
      metadata,
      organizationId: input.organizationId,
      userId: input.actor.id,
    },
  });

  await client.clientTimelineEvent.create({
    data: {
      actorId: input.actor.id,
      body: input.body ?? null,
      entityId: input.entityId,
      entityType: input.entityType,
      metadata,
      organizationId: input.organizationId,
      title: input.timelineTitle,
      type: input.type,
    },
  });
}

function toJsonObject(value: unknown) {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonObject;
}
