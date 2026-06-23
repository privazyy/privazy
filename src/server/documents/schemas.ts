import { z } from "zod";

export const documentGenerationInputSchema = z.object({
  organizationId: z.string().min(1),
  templateId: z.string().min(1),
  createdById: z.string().min(1),
  data: z.record(z.string(), z.unknown()),
});

export type DocumentGenerationInput = z.infer<typeof documentGenerationInputSchema>;

export const documentGenerateApiSchema = documentGenerationInputSchema.extend({
  idempotencyKey: z.string().optional(),
});
