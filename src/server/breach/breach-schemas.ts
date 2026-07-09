import { z } from "zod";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => value || undefined);

const nullableOptionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullable()
    .optional()
    .transform((value) => value || null);

const categoryList = z.array(z.string().trim().min(1).max(120)).max(30).default([]);
const dateSchema = z.coerce.date();

const breachBaseFields = {
  title: z.string().trim().min(4).max(180),
  description: z.string().trim().min(20).max(12_000),
  occurredAt: dateSchema.nullable().optional(),
  discoveredAt: dateSchema,
  affectedDataCategories: categoryList,
  affectedDataSubjectCategories: categoryList,
  approximateAffectedSubjects: z.number().int().min(0).max(100_000_000).nullable().optional(),
  cause: nullableOptionalText(8_000),
  consequences: nullableOptionalText(8_000),
  measuresTaken: nullableOptionalText(8_000),
  measuresPlanned: nullableOptionalText(8_000),
  contactName: optionalText(160),
  contactEmail: z.email().max(180).optional().or(z.literal("").transform(() => undefined)),
  contactPhone: optionalText(80),
};

export const createBreachIncidentSchema = z
  .object(breachBaseFields)
  .strict()
  .refine((value) => !value.occurredAt || value.occurredAt <= value.discoveredAt, {
    message: "Data wystapienia nie moze byc pozniejsza niz data wykrycia.",
    path: ["occurredAt"],
  });

export const updateBreachIncidentSchema = z
  .object({
    ...breachBaseFields,
    assignedToId: z.string().trim().max(64).nullable().optional(),
    severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  })
  .partial()
  .strict()
  .refine((value) => Object.keys(value).length > 0, "Podaj co najmniej jedno pole.");

export const submitBreachIncidentSchema = z.object({ confirm: z.literal(true).default(true) }).strict();

export const breachRiskAssessmentSchema = z
  .object({
    severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
    riskLevel: z.enum(["LOW", "MEDIUM", "HIGH", "UNKNOWN"]),
    specialCategoryData: z.boolean().default(false),
    childrenData: z.boolean().default(false),
    largeScale: z.boolean().default(false),
    identityTheftRisk: z.boolean().default(false),
    encryptedData: z.boolean().default(false),
    accessRecovered: z.boolean().default(false),
    mitigationMeasuresApplied: z.boolean().default(false),
    authorityNotificationRequired: z.boolean(),
    dataSubjectsNotificationRequired: z.boolean(),
    decisionRationale: z.string().trim().min(10).max(8_000),
  })
  .strict();

export const breachStatusChangeSchema = z
  .object({
    status: z.enum([
      "DRAFT",
      "REPORTED",
      "TRIAGE",
      "RISK_ASSESSMENT",
      "NOTIFICATION_REQUIRED",
      "NOTIFICATION_NOT_REQUIRED",
      "NOTIFIED_AUTHORITY",
      "NOTIFIED_DATA_SUBJECTS",
      "CLOSED",
      "CANCELLED",
    ]),
    rationale: optionalText(4_000),
  })
  .strict();

export const breachNoteCreateSchema = z
  .object({
    body: z.string().trim().min(1).max(10_000),
    visibility: z.enum(["INTERNAL", "PUBLIC"]).default("INTERNAL"),
  })
  .strict();

export const breachListQuerySchema = z
  .object({
    q: z.string().trim().max(160).optional(),
    status: z
      .enum([
        "DRAFT",
        "REPORTED",
        "TRIAGE",
        "RISK_ASSESSMENT",
        "NOTIFICATION_REQUIRED",
        "NOTIFICATION_NOT_REQUIRED",
        "NOTIFIED_AUTHORITY",
        "NOTIFIED_DATA_SUBJECTS",
        "CLOSED",
        "CANCELLED",
      ])
      .optional(),
    riskLevel: z.enum(["LOW", "MEDIUM", "HIGH", "UNKNOWN"]).optional(),
    severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
    assignedToId: z.string().trim().max(64).optional(),
    cursor: z.string().trim().max(64).optional(),
    limit: z.coerce.number().int().min(1).max(100).default(25),
  })
  .strict();
