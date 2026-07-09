import { z } from "zod";

const dateString = z
  .string()
  .trim()
  .max(40)
  .refine((value) => !Number.isNaN(Date.parse(value)), "Nieprawidlowa data.");

const documentType = z.enum([
  "PRIVACY_POLICY",
  "RODO_POLICY",
  "PROCESSING_REGISTER",
  "PROCESSING_AGREEMENT",
  "DPIA",
  "COOKIE_POLICY",
  "DATA_BREACH_PROCEDURE",
  "DATA_SUBJECT_REQUEST_PROCEDURE",
  "CLEAN_DESK_POLICY",
  "IT_SECURITY_INSTRUCTION",
  "AUTHORIZATION_TEMPLATE",
  "TRAINING_MATERIAL",
]);

export const crmOrderListQuerySchema = z
  .object({
    q: z.string().trim().max(160).optional(),
    status: z.enum(["DRAFT", "PLACED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "ARCHIVED"]).optional(),
    paymentStatus: z.enum(["PENDING", "PROCESSING", "PAID", "FAILED", "CANCELLED", "REFUNDED"]).optional(),
    invoiceStatus: z.enum(["NOT_REQUESTED", "REQUESTED", "ISSUED", "FAILED", "CANCELLED"]).optional(),
    fulfillmentStatus: z.enum(["WAITING_FOR_PAYMENT", "WAITING_FOR_INPUT", "IN_PROGRESS", "IN_REVIEW", "READY", "DELIVERED", "CANCELLED"]).optional(),
    organizationId: z.string().trim().max(64).optional(),
    email: z.email().max(180).transform((value) => value.toLowerCase()).optional(),
    productId: z.string().trim().max(64).optional(),
    documentType: documentType.optional(),
    dateFrom: dateString.optional(),
    dateTo: dateString.optional(),
    cursor: z.string().trim().max(64).optional(),
    limit: z.coerce.number().int().min(1).max(100).default(25),
  })
  .strict();

export const crmPaymentListQuerySchema = z
  .object({
    q: z.string().trim().max(160).optional(),
    status: z.enum(["PENDING", "PROCESSING", "PAID", "FAILED", "CANCELLED", "REFUNDED"]).optional(),
    provider: z.enum(["MOCK", "SANDBOX"]).optional(),
    orderId: z.string().trim().max(64).optional(),
    organizationId: z.string().trim().max(64).optional(),
    cursor: z.string().trim().max(64).optional(),
    limit: z.coerce.number().int().min(1).max(100).default(25),
  })
  .strict();

export const crmInvoiceListQuerySchema = z
  .object({
    q: z.string().trim().max(160).optional(),
    status: z.enum(["NOT_REQUESTED", "REQUESTED", "ISSUED", "FAILED", "CANCELLED"]).optional(),
    mode: z.enum(["MOCK", "SANDBOX"]).optional(),
    orderId: z.string().trim().max(64).optional(),
    organizationId: z.string().trim().max(64).optional(),
    cursor: z.string().trim().max(64).optional(),
    limit: z.coerce.number().int().min(1).max(100).default(25),
  })
  .strict();

export const orderNoteSchema = z.object({ body: z.string().trim().min(1).max(10_000) }).strict();

export const assignOrderOwnerSchema = z.object({ ownerId: z.string().trim().max(64).nullable() }).strict();

export const updateOrderInternalStatusSchema = z
  .object({
    status: z.enum(["PLACED", "IN_PROGRESS", "COMPLETED", "ARCHIVED"]).optional(),
    fulfillmentStatus: z.enum(["WAITING_FOR_PAYMENT", "WAITING_FOR_INPUT", "IN_PROGRESS", "IN_REVIEW", "READY", "DELIVERED", "CANCELLED"]).optional(),
    internalNote: z.string().trim().max(1000).nullable().optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, "Podaj co najmniej jedno pole.");

export const invoiceRequestSchema = z
  .object({
    mode: z.enum(["MOCK", "SANDBOX"]).default("MOCK"),
  })
  .strict();

export const paymentReviewSchema = z
  .object({
    reviewStatus: z.enum(["REVIEWED", "FLAGGED"]).default("REVIEWED"),
  })
  .strict();

export const documentJobListQuerySchema = z
  .object({
    status: z.enum(["PENDING", "PROCESSING", "COMPLETED", "FAILED"]).optional(),
    organizationId: z.string().trim().max(64).optional(),
    orderId: z.string().trim().max(64).optional(),
    cursor: z.string().trim().max(64).optional(),
    limit: z.coerce.number().int().min(1).max(100).default(25),
  })
  .strict();

export const generatedDocumentListQuerySchema = z
  .object({
    status: z.enum(["DRAFT", "GENERATED", "DELIVERED", "ARCHIVED"]).optional(),
    reviewStatus: z.enum(["NOT_REQUIRED", "PENDING", "APPROVED", "REJECTED"]).optional(),
    organizationId: z.string().trim().max(64).optional(),
    orderId: z.string().trim().max(64).optional(),
    cursor: z.string().trim().max(64).optional(),
    limit: z.coerce.number().int().min(1).max(100).default(25),
  })
  .strict();

export const documentReviewSchema = z
  .object({
    note: z.string().trim().max(1000).optional(),
  })
  .strict();
