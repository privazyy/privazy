import "server-only";

import { EventLogStatus, Prisma } from "@prisma/client";

import { getPrisma } from "@/server/db/prisma";
import type { WorkflowEventPayload, WorkflowEventType } from "@/server/events/event-types";

type PrismaClientOrTx = ReturnType<typeof getPrisma> | Prisma.TransactionClient;

export async function recordEventLog(input: {
  actorId?: string | null;
  eventType: WorkflowEventType;
  idempotencyKey: string;
  organizationId?: string | null;
  payload: WorkflowEventPayload;
  source?: string | null;
  tx?: PrismaClientOrTx;
}) {
  const prisma = input.tx ?? getPrisma();

  return prisma.eventLog.upsert({
    create: {
      actorId: input.actorId ?? null,
      eventType: input.eventType,
      idempotencyKey: input.idempotencyKey,
      organizationId: input.organizationId ?? null,
      payload: sanitizeEventPayload(input.payload),
      source: input.source ?? "app",
      status: EventLogStatus.PENDING,
      version: "v1",
    },
    update: {
      payload: sanitizeEventPayload(input.payload),
      source: input.source ?? "app",
    },
    where: { idempotencyKey: input.idempotencyKey },
  });
}

export async function markEventDispatched(eventLogId: string) {
  return getPrisma().eventLog.update({
    data: { dispatchedAt: new Date(), status: EventLogStatus.DISPATCHED },
    where: { id: eventLogId },
  });
}

export async function markEventProcessed(eventLogId: string) {
  return getPrisma().eventLog.update({
    data: { processedAt: new Date(), status: EventLogStatus.PROCESSED },
    where: { id: eventLogId },
  });
}

export async function markEventFailed(eventLogId: string, error: unknown) {
  return getPrisma().eventLog.update({
    data: {
      errorMessage: error instanceof Error ? error.message : "Unknown workflow error",
      status: EventLogStatus.FAILED,
    },
    where: { id: eventLogId },
  });
}

export function sanitizeEventPayload(payload: WorkflowEventPayload) {
  const allowedKeys = new Set([
    "actorId",
    "blogPostId",
    "eventLogId",
    "formSubmissionId",
    "generatedDocumentId",
    "idempotencyKey",
    "invoiceId",
    "jobId",
    "messageId",
    "orderId",
    "orderItemId",
    "orderItemIds",
    "paymentId",
    "resourceId",
    "subscriberId",
    "taskId",
    "threadId",
    "version",
    "organizationId",
    "source",
    "status",
    "window",
  ]);

  return Object.fromEntries(
    Object.entries(payload).filter(([key]) => allowedKeys.has(key)),
  ) as Prisma.InputJsonObject;
}
