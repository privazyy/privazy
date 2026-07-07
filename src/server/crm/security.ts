import { z } from "zod";

import { safeHttpError } from "@/server/api/errors";
import { actorFromSession, canMutateCrm, canReadCrm, type AppSessionLike } from "@/server/auth/permissions";

export const crmLeadsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).catch(50),
});

export type CrmLeadSafeShape = {
  id: string;
  company: string;
  industry: string;
  source: string;
  resultLabel: string;
  value: number;
  stage: string;
  owner: string;
  lastActivity: string;
  hot: boolean;
};

export function requireCrmApiRead(session: AppSessionLike) {
  const actor = actorFromSession(session);
  if (!actor) throw safeHttpError("unauthorized", "Authentication required.");
  if (!canReadCrm(actor)) throw safeHttpError("forbidden", "CRM access denied.");

  return actor;
}

export function requireCrmApiMutation(session: AppSessionLike) {
  const actor = requireCrmApiRead(session);
  if (!canMutateCrm(actor)) throw safeHttpError("forbidden", "CRM mutation denied.");

  return actor;
}

export function serializeCrmLead(input: CrmLeadSafeShape & Record<string, unknown>): CrmLeadSafeShape {
  return {
    company: input.company,
    hot: input.hot,
    id: input.id,
    industry: input.industry,
    lastActivity: input.lastActivity,
    owner: input.owner,
    resultLabel: input.resultLabel,
    source: input.source,
    stage: input.stage,
    value: input.value,
  };
}
