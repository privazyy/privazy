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

export const leadCreateSchema = z
  .object({
    source: z.enum(["IOD_CHECKER", "CONTACT_FORM", "MANUAL", "WEBSITE", "REFERRAL", "OTHER"]).default("MANUAL"),
    status: z.enum(["NEW", "TO_CONTACT", "CONTACTED", "QUALIFIED", "UNQUALIFIED", "PROPOSAL_SENT", "CONVERTED", "WON", "LOST", "ARCHIVED"]).default("NEW"),
    priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).default("NORMAL"),
    companyName: z.string().trim().min(2).max(160),
    fullName: z.string().trim().min(2).max(160),
    email: z.email().max(180).transform((value) => value.toLowerCase()),
    phone: optionalText(48),
    nip: optionalText(24),
    industry: optionalText(120),
    companySize: optionalText(80),
    estimatedValue: z.number().finite().nonnegative().max(99_999_999.99).optional(),
    consentMarketing: z.boolean().default(false),
    consentPrivacy: z.boolean().default(false),
    consentContact: z.boolean().default(false),
    assignedToId: optionalText(64),
    sourceDetails: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

export const leadUpdateSchema = z
  .object({
    status: z.enum(["NEW", "TO_CONTACT", "CONTACTED", "QUALIFIED", "UNQUALIFIED", "PROPOSAL_SENT", "CONVERTED", "WON", "LOST", "ARCHIVED"]).optional(),
    priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).optional(),
    companyName: z.string().trim().min(2).max(160).optional(),
    fullName: z.string().trim().min(2).max(160).optional(),
    email: z.email().max(180).transform((value) => value.toLowerCase()).optional(),
    phone: nullableOptionalText(48),
    nip: nullableOptionalText(24),
    industry: nullableOptionalText(120),
    companySize: nullableOptionalText(80),
    estimatedValue: z.number().finite().nonnegative().max(99_999_999.99).nullable().optional(),
    consentMarketing: z.boolean().optional(),
    consentPrivacy: z.boolean().optional(),
    consentContact: z.boolean().optional(),
    assignedToId: z.string().trim().max(64).nullable().optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, "Podaj co najmniej jedno pole.");

export const leadConvertSchema = z
  .object({
    organizationId: z.string().trim().min(1).max(64).optional(),
    organizationName: z.string().trim().min(2).max(160).optional(),
  })
  .strict();

export const organizationCreateSchema = z
  .object({
    name: z.string().trim().min(2).max(160),
    legalName: optionalText(200),
    nip: optionalText(24),
    regon: optionalText(24),
    website: optionalText(240),
    email: z.email().max(180).transform((value) => value.toLowerCase()).optional(),
    phone: optionalText(48),
    industry: optionalText(120),
    size: optionalText(80),
    status: z.enum(["PROSPECT", "ACTIVE", "INACTIVE", "ARCHIVED"]).default("PROSPECT"),
    ownerId: optionalText(64),
    addressLine1: optionalText(200),
    addressLine2: optionalText(200),
    postalCode: optionalText(20),
    city: optionalText(120),
    country: z.string().trim().length(2).default("PL"),
  })
  .strict();

export const organizationUpdateSchema = organizationCreateSchema
  .partial()
  .extend({
    email: z.email().max(180).transform((value) => value.toLowerCase()).nullable().optional(),
    ownerId: z.string().trim().max(64).nullable().optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, "Podaj co najmniej jedno pole.");

export const crmNoteCreateSchema = z
  .object({
    leadId: z.string().trim().min(1).max(64).optional(),
    organizationId: z.string().trim().min(1).max(64).optional(),
    body: z.string().trim().min(1).max(10_000),
  })
  .strict()
  .refine((value) => Boolean(value.leadId || value.organizationId), "Notatka wymaga leada lub organizacji.");

export const crmNoteBodySchema = z.object({ body: z.string().trim().min(1).max(10_000) }).strict();

export const leadStatusChangeSchema = z
  .object({
    status: z.enum(["NEW", "TO_CONTACT", "CONTACTED", "QUALIFIED", "UNQUALIFIED", "PROPOSAL_SENT", "CONVERTED", "WON", "LOST", "ARCHIVED"]),
  })
  .strict();

export const leadAssignSchema = z
  .object({ assignedToId: z.string().trim().max(64).nullable() })
  .strict();

export const leadListQuerySchema = z
  .object({
    q: z.string().trim().max(160).optional(),
    status: z.enum(["NEW", "TO_CONTACT", "CONTACTED", "QUALIFIED", "UNQUALIFIED", "PROPOSAL_SENT", "CONVERTED", "WON", "LOST", "ARCHIVED"]).optional(),
    source: z.enum(["IOD_CHECKER", "CONTACT_FORM", "MANUAL", "WEBSITE", "REFERRAL", "OTHER"]).optional(),
    assignedToId: z.string().trim().max(64).optional(),
    cursor: z.string().trim().max(64).optional(),
    limit: z.coerce.number().int().min(1).max(100).default(25),
  })
  .strict();

export const organizationListQuerySchema = z
  .object({
    q: z.string().trim().max(160).optional(),
    status: z.enum(["PROSPECT", "ACTIVE", "INACTIVE", "ARCHIVED"]).optional(),
    industry: z.string().trim().max(120).optional(),
    ownerId: z.string().trim().max(64).optional(),
    cursor: z.string().trim().max(64).optional(),
    limit: z.coerce.number().int().min(1).max(100).default(25),
  })
  .strict();
