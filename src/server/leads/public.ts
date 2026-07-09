import "server-only";

import { Prisma } from "@prisma/client";
import { z } from "zod";

import { getPrisma } from "@/server/db/prisma";

export const PUBLIC_LEAD_FORM_TYPE = "public_site_lead";

const optionalText = (max = 240) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => (value ? value : undefined));

const publicLeadUtmSchema = z
  .record(z.string().trim().max(40), z.string().trim().max(240))
  .optional()
  .default({});

export const publicLeadPayloadSchema = z.object({
  contact: z.object({
    name: z.string().trim().min(2).max(120),
    email: z.email().max(180),
    phone: optionalText(48),
    company: z.string().trim().min(2).max(160),
    nip: optionalText(24),
    consent: z.boolean().refine((value) => value, "Consent is required"),
  }),
  message: optionalText(1200),
  source: z
    .object({
      page: optionalText(180),
      placement: optionalText(120),
      subject: optionalText(160),
      serviceSlug: optionalText(80),
      industrySlug: optionalText(80),
      utm: publicLeadUtmSchema,
    })
    .optional(),
  checker: z
    .object({
      answers: z.record(z.string().trim().max(80), z.string().trim().max(240)).optional(),
      resultTitle: optionalText(240),
      resultStatus: optionalText(80),
      resultTrigger: optionalText(120),
      scale: optionalText(80),
      complianceResult: z.unknown().optional(),
    })
    .optional(),
  turnstileToken: optionalText(1200),
});

export type PublicLeadPayload = z.infer<typeof publicLeadPayloadSchema>;

export type PublicLeadMeta = {
  ipAddress?: string;
  referrer?: string;
  userAgent?: string;
};

type PublicLeadSubmissionData = PublicLeadPayload & {
  consent: {
    contact: true;
  };
  meta: PublicLeadMeta;
  submittedAt: string;
  formVersion: "public-site-v1";
};

export async function createPublicLead(payload: PublicLeadPayload, meta: PublicLeadMeta) {
  const prisma = getPrisma();

  const created = await prisma.$transaction(async (tx) => {
    const organization = await tx.organization.create({
      data: {
        name: payload.contact.company,
        nip: payload.contact.nip,
        email: payload.contact.email,
        phone: payload.contact.phone,
      },
    });

    const submissionData: PublicLeadSubmissionData = {
      ...payload,
      consent: {
        contact: true,
      },
      meta,
      submittedAt: new Date().toISOString(),
      formVersion: "public-site-v1",
    };

    const submission = await tx.formSubmission.create({
      data: {
        organizationId: organization.id,
        formType: PUBLIC_LEAD_FORM_TYPE,
        status: "SUBMITTED",
        data: toJsonObject(submissionData),
      },
    });

    return { organization, submission };
  });

  return {
    leadId: created.submission.id,
    organizationId: created.organization.id,
  };
}

function toJsonObject(value: PublicLeadSubmissionData) {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonObject;
}
