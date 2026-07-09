import { z } from "zod";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => value || undefined);

const nullableText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullable()
    .optional()
    .transform((value) => value || null);

const dsrType = z.enum([
  "ACCESS",
  "COPY",
  "RECTIFICATION",
  "ERASURE",
  "RESTRICTION",
  "PORTABILITY",
  "OBJECTION",
  "WITHDRAW_CONSENT",
  "AUTOMATED_DECISION",
  "OTHER",
]);

const dsrStatus = z.enum([
  "DRAFT",
  "RECEIVED",
  "IDENTITY_VERIFICATION",
  "IN_PROGRESS",
  "WAITING_FOR_INFORMATION",
  "RESPONSE_PREPARED",
  "RESPONDED",
  "REJECTED",
  "CLOSED",
  "CANCELLED",
]);

export const dsrListQuerySchema = z
  .object({
    q: z.string().trim().max(160).optional(),
    status: dsrStatus.optional(),
    type: dsrType.optional(),
    organizationId: z.string().trim().max(64).optional(),
    assignedToId: z.string().trim().max(64).optional(),
    cursor: z.string().trim().max(64).optional(),
    limit: z.coerce.number().int().min(1).max(100).default(25),
  })
  .strict();

export const portalDsrCreateSchema = z
  .object({
    requesterName: z.string().trim().min(2).max(160),
    requesterEmail: z.email().max(180).transform((value) => value.toLowerCase()),
    requesterPhone: optionalText(48),
    relationship: optionalText(120),
    type: dsrType,
    priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).default("NORMAL"),
    requestDescription: z.string().trim().min(10).max(20_000),
    additionalInformation: optionalText(20_000),
  })
  .strict();

export const portalDsrDraftUpdateSchema = portalDsrCreateSchema
  .partial()
  .strict()
  .refine((value) => Object.keys(value).length > 0, "Podaj co najmniej jedno pole.");

export const portalDsrSubmitSchema = z.object({}).strict();

export const crmDsrUpdateSchema = z
  .object({
    assignedToId: z.string().trim().max(64).nullable().optional(),
    priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).optional(),
    additionalInformation: nullableText(20_000),
    extensionUntil: z.coerce.date().nullable().optional(),
    extensionReason: nullableText(10_000),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, "Podaj co najmniej jedno pole.");

export const crmDsrStatusSchema = z
  .object({
    status: dsrStatus,
    note: optionalText(10_000),
  })
  .strict();

export const crmDsrIdentitySchema = z
  .object({
    verificationStatus: z.enum(["NOT_STARTED", "PENDING", "VERIFIED", "FAILED", "NOT_REQUIRED"]),
    verificationMethod: nullableText(120),
    verificationNote: nullableText(10_000),
  })
  .strict();

export const crmDsrPrepareResponseSchema = z
  .object({
    responseSummary: z.string().trim().min(3).max(20_000),
    responseDraft: z.string().trim().min(3).max(50_000),
    responseDecision: z.string().trim().min(2).max(120),
    decisionRationale: optionalText(20_000),
  })
  .strict();

export const crmDsrNoteSchema = z
  .object({
    note: z.string().trim().min(1).max(20_000),
    visibility: z.enum(["INTERNAL", "PUBLIC"]).default("INTERNAL"),
  })
  .strict();
