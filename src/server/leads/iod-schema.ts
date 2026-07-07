import { z } from "zod";

import { iodObligationStatuses } from "@/lib/iod-obligation-checker";

const optionalText = (max = 160) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => (value ? value : undefined));

const landingAnswersSchema = z
  .record(z.string().trim().min(1).max(80), z.string().trim().min(1).max(180))
  .refine((answers) => Object.keys(answers).length >= 3, "Checker answers are required")
  .refine((answers) => Object.keys(answers).length <= 30, "Too many checker answers");

export const iodLeadPayloadSchema = z
  .object({
    answers: landingAnswersSchema,
    contact: z
      .object({
        company: z.string().trim().min(2).max(160),
        email: z.email().trim().toLowerCase().max(180),
        marketingConsent: z.boolean().optional().default(false),
        name: z.string().trim().min(2).max(120),
        phone: optionalText(48),
        privacyConsent: z.boolean().refine((value) => value, "Contact consent is required"),
      })
      .strict(),
    resultSummary: z
      .object({
        obligationStatus: z.enum(iodObligationStatuses).optional(),
        primaryTrigger: optionalText(80),
        scale: optionalText(80),
      })
      .strict()
      .optional(),
    source: z
      .object({
        campaign: optionalText(120),
        page: optionalText(80),
        placement: optionalText(80),
        referrer: optionalText(500),
        utmCampaign: optionalText(120),
        utmMedium: optionalText(120),
        utmSource: optionalText(120),
      })
      .strict()
      .optional(),
    turnstileToken: optionalText(4096),
    website: optionalText(200),
  })
  .strict();

export type IodLeadPayload = z.infer<typeof iodLeadPayloadSchema>;

export function hasHoneypotValue(payload: IodLeadPayload) {
  return Boolean(payload.website);
}
