import "server-only";

import { EmailLogStatus } from "@prisma/client";

import { getPrisma } from "@/server/db/prisma";
import type { EmailTemplateName } from "@/server/email/templates/transactional";

export async function createQueuedEmailLog(input: {
  entityId?: string | null;
  entityType?: string | null;
  idempotencyKey: string;
  organizationId?: string | null;
  recipient: string;
  subject: string;
  template: EmailTemplateName;
}) {
  return getPrisma().emailLog.upsert({
    create: {
      entityId: input.entityId ?? null,
      entityType: input.entityType ?? null,
      idempotencyKey: input.idempotencyKey,
      organizationId: input.organizationId ?? null,
      recipient: input.recipient,
      status: EmailLogStatus.QUEUED,
      subject: input.subject,
      template: input.template,
    },
    update: {
      subject: input.subject,
    },
    where: { idempotencyKey: input.idempotencyKey },
  });
}

export async function markEmailLogSent(id: string, providerId?: string | null) {
  return getPrisma().emailLog.update({
    data: { providerId: providerId ?? null, status: EmailLogStatus.SENT },
    where: { id },
  });
}

export async function markEmailLogSkipped(id: string, providerId?: string | null) {
  return getPrisma().emailLog.update({
    data: { providerId: providerId ?? null, status: EmailLogStatus.SKIPPED },
    where: { id },
  });
}

export async function markEmailLogFailed(id: string, error: unknown) {
  return getPrisma().emailLog.update({
    data: {
      error: error instanceof Error ? error.message : "Unknown email error",
      status: EmailLogStatus.FAILED,
    },
    where: { id },
  });
}
