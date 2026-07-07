import { z } from "zod";

import { safeHttpError } from "@/server/api/errors";
import {
  actorFromSession,
  canReviewDocuments,
  type AppActor,
  type AppSessionLike,
} from "@/server/auth/permissions";
import { documentGenerationInputSchema } from "@/server/documents/schemas";

export const documentQueryInputSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).catch(50),
  organizationId: z.string().optional(),
  status: z.enum(["PENDING", "PROCESSING", "COMPLETED", "FAILED"]).optional(),
});

export function assertCanGenerateDocument(actor: AppActor | null | undefined) {
  if (!actor) throw safeHttpError("unauthorized", "Authentication required.");
  if (!canReviewDocuments(actor)) throw safeHttpError("forbidden", "Document generation denied.");

  return actor;
}

export function resolveDocumentGenerationContext(session: AppSessionLike, payload: unknown) {
  const actor = assertCanGenerateDocument(actorFromSession(session));

  const parsed = documentGenerationInputSchema.safeParse(payload);
  if (!parsed.success) {
    throw parsed.error;
  }

  return {
    actor,
    input: {
      ...parsed.data,
      createdById: actor.id,
    },
  };
}
