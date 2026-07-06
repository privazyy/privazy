import "server-only";

import { AutomationRunStatus, type Prisma } from "@prisma/client";

import { getPrisma } from "@/server/db/prisma";
import { getRuleForEvent } from "@/server/automations/rules";
import type { WorkflowEventType } from "@/server/events/event-types";
import { markEventFailed, markEventProcessed } from "@/server/events/event-log";

export async function runAutomation<T>(input: {
  actorId?: string | null;
  eventLogId?: string | null;
  eventType: WorkflowEventType;
  functionName: string;
  idempotencyKey: string;
  maxAttempts?: number;
  organizationId?: string | null;
  task: (tx: Prisma.TransactionClient) => Promise<T>;
}) {
  const prisma = getPrisma();
  const existing = await prisma.automationRun.findUnique({ where: { idempotencyKey: input.idempotencyKey } });

  if (existing?.status === AutomationRunStatus.SUCCEEDED || existing?.status === AutomationRunStatus.RUNNING) {
    return { output: existing.output as T | null, run: existing, skipped: true };
  }

  const rule = await getRuleForEvent(input.eventType);
  const run = await prisma.automationRun.upsert({
    create: {
      actorId: input.actorId ?? null,
      attempts: 1,
      eventLogId: input.eventLogId ?? null,
      functionName: input.functionName,
      idempotencyKey: input.idempotencyKey,
      maxAttempts: input.maxAttempts ?? rule?.maxAttempts ?? 3,
      organizationId: input.organizationId ?? null,
      ruleId: rule?.id ?? null,
      startedAt: new Date(),
      status: AutomationRunStatus.RUNNING,
    },
    update: {
      attempts: { increment: 1 },
      errorMessage: null,
      startedAt: new Date(),
      status: AutomationRunStatus.RUNNING,
    },
    where: { idempotencyKey: input.idempotencyKey },
  });

  try {
    const output = await prisma.$transaction(input.task);
    const finished = await prisma.automationRun.update({
      data: {
        finishedAt: new Date(),
        output: toJson(output),
        status: AutomationRunStatus.SUCCEEDED,
      },
      where: { id: run.id },
    });

    if (input.eventLogId) await markEventProcessed(input.eventLogId).catch(() => undefined);
    return { output, run: finished, skipped: false };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown automation error";
    const shouldRetry = run.attempts < run.maxAttempts;
    const failed = await prisma.automationRun.update({
      data: {
        errorMessage,
        finishedAt: new Date(),
        nextRetryAt: shouldRetry ? new Date(Date.now() + 15 * 60 * 1000) : null,
        status: shouldRetry ? AutomationRunStatus.RETRY_PENDING : AutomationRunStatus.FAILED,
      },
      where: { id: run.id },
    });

    if (input.eventLogId) await markEventFailed(input.eventLogId, error).catch(() => undefined);
    return { error, run: failed, skipped: false };
  }
}

function toJson(value: unknown): Prisma.InputJsonValue {
  if (value === undefined) return {};
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}
