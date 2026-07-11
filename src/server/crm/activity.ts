import "server-only";

import type { Prisma } from "@prisma/client";

import type { CrmActor } from "@/server/crm/access";
import { createCrmAuditLog } from "@/server/crm/audit";

type CrmActivityInput = {
  action: string;
  actor: CrmActor;
  entityId: string;
  entityType: string;
  metadata?: Record<string, unknown>;
  organizationId?: string | null;
};

export function createCrmActivity(tx: Prisma.TransactionClient, input: CrmActivityInput) {
  return createCrmAuditLog(tx, input);
}
