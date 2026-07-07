import { z } from "zod";

export const documentGenerationInputSchema = z
  .object({
    organizationId: z.string().min(1),
    templateId: z.string().min(1),
    data: z.record(z.string(), z.unknown()),
    reason: z.string().trim().min(8).max(500).optional(),
  })
  .strict();

export type DocumentGenerationInput = z.infer<typeof documentGenerationInputSchema>;

export const documentGenerateApiSchema = documentGenerationInputSchema.extend({
  idempotencyKey: z.string().trim().min(8).max(160).optional(),
}).strict();

export type DocumentGenerateApiInput = z.infer<typeof documentGenerateApiSchema>;
