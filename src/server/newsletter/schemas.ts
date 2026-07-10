import { z } from "zod";

import { NEWSLETTER_CONSENT_TEXT } from "@/lib/newsletter";

export const newsletterSubscribeSchema = z
  .object({
    email: z.email().max(180).transform((value) => value.toLowerCase()),
    source: z.string().trim().min(2).max(120).default("website"),
    consentMarketing: z.literal(true, { error: "Zgoda marketingowa jest wymagana." }),
    consentTextSnapshot: z.string().trim().min(20).max(1_000).default(NEWSLETTER_CONSENT_TEXT),
    website: z.string().trim().max(0).optional(),
  })
  .strict();

export const newsletterUnsubscribeSchema = z
  .object({
    token: z.string().trim().min(32).max(256),
  })
  .strict();

export const newsletterResubscribeSchema = z
  .object({
    email: z.email().max(180).transform((value) => value.toLowerCase()),
    source: z.string().trim().min(2).max(120).default("website"),
    consentMarketing: z.literal(true, { error: "Zgoda marketingowa jest wymagana." }),
    consentTextSnapshot: z.string().trim().min(20).max(1_000).default(NEWSLETTER_CONSENT_TEXT),
  })
  .strict();

export const newsletterSubscriberListQuerySchema = z
  .object({
    status: z.enum(["PENDING", "ACTIVE", "UNSUBSCRIBED", "BOUNCED", "COMPLAINED"]).optional(),
    q: z.string().trim().max(160).optional(),
    cursor: z.string().trim().max(64).optional(),
    limit: z.coerce.number().int().min(1).max(100).default(25),
  })
  .strict();
