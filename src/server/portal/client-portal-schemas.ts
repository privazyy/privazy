import { z } from "zod";

const id = z.string().trim().min(1).max(80);
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal("").transform(() => undefined));

export const portalListQuerySchema = z
  .object({
    cursor: id.optional(),
    limit: z.coerce.number().int().min(1).max(100).default(25),
  })
  .strict();

export const portalDocumentQuerySchema = portalListQuerySchema
  .extend({
    status: z.enum(["DRAFT", "SUBMITTED", "LOCKED", "GENERATION_PENDING", "GENERATED", "NEEDS_CORRECTION", "CANCELLED"]).optional(),
  })
  .strict();

export const portalGeneratedDocumentQuerySchema = portalListQuerySchema
  .extend({
    status: z.enum(["DRAFT", "GENERATED", "DELIVERED", "ARCHIVED"]).optional(),
  })
  .strict();

export const portalOrganizationUpdateSchema = z
  .object({
    email: z.email().max(180).optional(),
    phone: optionalText(48),
    website: optionalText(240),
    addressLine1: optionalText(200),
    addressLine2: optionalText(200),
    postalCode: optionalText(20),
    city: optionalText(120),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, "Podaj co najmniej jedno pole.");

export const portalDownloadQuerySchema = z
  .object({
    fileType: z.enum(["docx", "pdf", "zip"]).default("docx"),
  })
  .strict();
