import { z } from "zod";

export const documentInputApiSchema = z.object({
  orderItemId: z.string().min(1),
  data: z.unknown(),
});

export const documentRetryApiSchema = z.object({
  reason: z.string().max(500).optional(),
});

export type DocumentInputApiPayload = z.infer<typeof documentInputApiSchema>;
