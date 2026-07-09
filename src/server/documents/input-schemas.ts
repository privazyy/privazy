import { z } from "zod";

const id = z.string().trim().min(1).max(80);
const text = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .refine((value) => !/[<>]/.test(value), "HTML nie jest dozwolony.");
const optionalText = (max: number) => text(max).optional().or(z.literal("").transform(() => undefined));
const urlLike = z.string().trim().min(3).max(240).regex(/^[a-z0-9.-]+(:\d+)?(\/.*)?$/i, "Podaj domenę bez HTML.");

const booleanDefaultFalse = z.boolean().default(false);

export const createDocumentInputFromOrderItemSchema = z.object({ orderItemId: id }).strict();

export const documentInputQuerySchema = z
  .object({
    status: z.enum(["DRAFT", "SUBMITTED", "LOCKED", "GENERATION_PENDING", "GENERATED", "NEEDS_CORRECTION", "CANCELLED"]).optional(),
    orderItemId: id.optional(),
    organizationId: id.optional(),
    documentType: z.enum([
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
    ]).optional(),
    cursor: id.optional(),
    limit: z.coerce.number().int().min(1).max(100).default(25),
  })
  .strict();

const privacyPolicyBaseSchema = z
  .object({
    administrator: z.object({
      name: text(180),
      legalForm: optionalText(80),
      address: text(240),
      taxId: optionalText(40),
      contactEmail: z.email().max(180),
      phone: optionalText(40),
    }),
    dataProtectionContact: z.object({
      privacyEmail: z.email().max(180),
      hasDpo: z.boolean(),
      dpoName: optionalText(160),
      dpoEmail: z.email().max(180).optional().or(z.literal("").transform(() => undefined)),
    }),
    website: z.object({
      domain: urlLike,
      serviceName: text(160),
      businessType: text(160),
      hasShop: booleanDefaultFalse,
      hasNewsletter: booleanDefaultFalse,
      hasContactForms: booleanDefaultFalse,
      hasUserAccounts: booleanDefaultFalse,
    }),
    peopleCategories: z.object({
      customers: booleanDefaultFalse,
      websiteUsers: booleanDefaultFalse,
      newsletterSubscribers: booleanDefaultFalse,
      contractors: booleanDefaultFalse,
      jobCandidates: booleanDefaultFalse,
      other: optionalText(500),
    }),
    processingPurposes: z.object({
      inquiries: booleanDefaultFalse,
      orders: booleanDefaultFalse,
      userAccount: booleanDefaultFalse,
      marketing: booleanDefaultFalse,
      newsletter: booleanDefaultFalse,
      analytics: booleanDefaultFalse,
      complaints: booleanDefaultFalse,
      legalObligations: booleanDefaultFalse,
      claims: booleanDefaultFalse,
    }),
    legalBases: z.object({
      contract: booleanDefaultFalse,
      legalObligation: booleanDefaultFalse,
      legitimateInterest: booleanDefaultFalse,
      consent: booleanDefaultFalse,
      other: optionalText(500),
    }),
    recipients: z.object({
      hosting: booleanDefaultFalse,
      emailProvider: booleanDefaultFalse,
      accounting: booleanDefaultFalse,
      payments: booleanDefaultFalse,
      couriers: booleanDefaultFalse,
      itSupport: booleanDefaultFalse,
      crm: booleanDefaultFalse,
      lawFirm: booleanDefaultFalse,
      other: optionalText(500),
    }),
    transfersOutsideEea: z.object({
      enabled: z.boolean(),
      tools: optionalText(500),
      country: optionalText(120),
      safeguards: optionalText(500),
    }),
    retention: z.object({
      inquiries: text(240),
      orders: text(240),
      invoices: text(240),
      newsletter: optionalText(240),
      accounts: optionalText(240),
      complaints: optionalText(240),
    }),
    dataSubjectRights: z.object({
      requestEmail: z.email().max(180),
      customNotes: optionalText(1000),
    }),
    cookies: z.object({
      usesCookies: z.boolean(),
      analytics: booleanDefaultFalse,
      marketing: booleanDefaultFalse,
      functional: booleanDefaultFalse,
      hasCookieBanner: booleanDefaultFalse,
      tools: optionalText(500),
    }),
    additionalNotes: z.object({
      customNotes: optionalText(2000),
      industryDetails: optionalText(1000),
      additionalSystems: optionalText(1000),
    }),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.dataProtectionContact.hasDpo && !value.dataProtectionContact.dpoEmail) {
      ctx.addIssue({
        code: "custom",
        path: ["dataProtectionContact", "dpoEmail"],
        message: "Podaj e-mail IOD albo odznacz powolanie IOD.",
      });
    }
    if (value.transfersOutsideEea.enabled && (!value.transfersOutsideEea.tools || !value.transfersOutsideEea.safeguards)) {
      ctx.addIssue({
        code: "custom",
        path: ["transfersOutsideEea", "safeguards"],
        message: "Opisz narzedzia i zabezpieczenia transferu poza EOG.",
      });
    }
  });

export const privacyPolicyDraftDataSchema = z.record(z.string().max(80), z.unknown()).superRefine((value, ctx) => {
  const size = JSON.stringify(value).length;
  if (size > 20_000) {
    ctx.addIssue({ code: "custom", message: "Draft jest zbyt duzy." });
  }
});

export const privacyPolicySubmitDataSchema = privacyPolicyBaseSchema.superRefine((value, ctx) => {
  const size = JSON.stringify(value).length;
  if (size > 30_000) {
    ctx.addIssue({ code: "custom", message: "Formularz jest zbyt duzy." });
  }
});

export const saveDocumentInputDraftSchema = z
  .object({
    documentInputId: id.optional(),
    orderItemId: id.optional(),
    data: privacyPolicyDraftDataSchema,
    clientRevision: z.number().int().min(1).max(1000).optional(),
  })
  .strict()
  .refine((value) => Boolean(value.documentInputId || value.orderItemId), "Podaj documentInputId albo orderItemId.");

export const submitDocumentInputSchema = z
  .object({
    documentInputId: id,
    data: privacyPolicySubmitDataSchema,
    confirmAccuracy: z.literal(true),
    acceptDocumentDisclaimer: z.literal(true),
  })
  .strict();

export const documentInputNeedsCorrectionSchema = z.object({ reason: text(1000).min(3) }).strict();
