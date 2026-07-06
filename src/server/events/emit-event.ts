import "server-only";

import { randomUUID } from "node:crypto";
import type { Prisma } from "@prisma/client";

import { inngest } from "@/server/inngest/client";
import { eventIdempotencyKey, type WorkflowEventPayload, type WorkflowEventType } from "@/server/events/event-types";
import { markEventDispatched, markEventFailed, recordEventLog } from "@/server/events/event-log";

export async function emitEvent(input: {
  actorId?: string | null;
  critical?: boolean;
  eventType: WorkflowEventType;
  idempotencyKey?: string;
  organizationId?: string | null;
  payload: WorkflowEventPayload;
  source?: string | null;
  tx?: Prisma.TransactionClient;
}) {
  const idempotencyKey =
    input.idempotencyKey ??
    eventIdempotencyKey({
      eventType: input.eventType,
      resourceId: String(input.payload.resourceId ?? input.payload.entityId ?? input.payload.orderId ?? input.payload.jobId ?? randomUUID()),
    });

  try {
    const eventLog = await recordEventLog({
      actorId: input.actorId ?? input.payload.actorId as string | undefined,
      eventType: input.eventType,
      idempotencyKey,
      organizationId: input.organizationId ?? input.payload.organizationId as string | undefined,
      payload: input.payload,
      source: input.source,
      tx: input.tx,
    });

    if (eventLog.status === "DISPATCHED" || eventLog.status === "PROCESSED") {
      return { eventLogId: eventLog.id, idempotencyKey, ok: true, skipped: true };
    }

    await inngest.send({
      data: {
        ...input.payload,
        eventLogId: eventLog.id,
        idempotencyKey,
        version: "v1",
      },
      id: idempotencyKey,
      name: input.eventType,
    });

    await markEventDispatched(eventLog.id);
    return { eventLogId: eventLog.id, idempotencyKey, ok: true };
  } catch (error) {
    if (input.idempotencyKey) {
      await recordEventLog({
        actorId: input.actorId ?? null,
        eventType: input.eventType,
        idempotencyKey,
        organizationId: input.organizationId ?? null,
        payload: input.payload,
        source: input.source,
      })
        .then((eventLog) => markEventFailed(eventLog.id, error))
        .catch(() => undefined);
    }

    console.error("Workflow event dispatch failed", { eventType: input.eventType, error });
    if (input.critical) throw error;
    return { idempotencyKey, ok: false };
  }
}
