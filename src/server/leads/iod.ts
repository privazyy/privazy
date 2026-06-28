import "server-only";

import { Prisma, type FormSubmission, type Organization } from "@prisma/client";
import { z } from "zod";

import {
  calculateIodResult,
  iodScaleLabels,
  iodSectorLabels,
  type IodCheckerAnswers,
  type IodResultLevel,
} from "@/lib/iod-checker";
import { getPrisma } from "@/server/db/prisma";

export const IOD_LEAD_FORM_TYPE = "iod_checker_lead";

const optionalText = (max = 160) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => (value ? value : undefined));

export const iodLeadPayloadSchema = z.object({
  answers: z.object({
    publiczny: z.enum(["tak", "nie"]),
    branza: z.enum(["zdrowie", "finanse", "ecommerce", "it", "marketing", "edukacja", "publiczny", "inne"]),
    monitoring: z.enum(["tak", "nie", "nie_wiem"]),
    wrazliwe: z.enum(["tak", "nie", "nie_wiem"]),
    skala: z.enum(["s", "m", "l", "xl"]),
    iod: z.enum(["tak", "nie", "nie_wiem"]),
  }),
  contact: z.object({
    company: z.string().trim().min(2).max(160),
    nip: optionalText(24),
    employees: optionalText(48),
    name: z.string().trim().min(2).max(120),
    email: z.email().max(180),
    phone: z.string().trim().min(6).max(48),
    privacyConsent: z.boolean().refine((value) => value, "Privacy consent is required"),
    marketingConsent: z.boolean().optional().default(false),
  }),
  source: z
    .object({
      page: optionalText(80),
      placement: optionalText(80),
      campaign: optionalText(120),
    })
    .optional(),
});

export type IodLeadPayload = z.infer<typeof iodLeadPayloadSchema>;

export type RequestLeadMeta = {
  ipAddress?: string;
  referrer?: string;
  userAgent?: string;
};

type IodLeadSubmissionData = {
  answers: IodCheckerAnswers;
  labels: {
    branza: string;
    skala: string;
  };
  result: ReturnType<typeof calculateIodResult>;
  contact: IodLeadPayload["contact"];
  consents: {
    privacy: true;
    marketing: boolean;
  };
  source: {
    page?: string;
    placement?: string;
    campaign?: string;
  } & RequestLeadMeta;
  lead: {
    source: string;
    stage: "Nowy";
    owner: "AK" | "MW" | "JZ";
    value: number;
    hot: boolean;
  };
  submittedAt: string;
  formVersion: string;
};

type SubmissionWithOrganization = FormSubmission & {
  organization: Organization;
};

export async function createIodLead(payload: IodLeadPayload, meta: RequestLeadMeta) {
  const prisma = getPrisma();
  const result = calculateIodResult(payload.answers);
  const owner = pickLeadOwner(result.level);

  const created = await prisma.$transaction(async (tx) => {
    const organization = await tx.organization.create({
      data: {
        name: payload.contact.company,
        nip: payload.contact.nip,
        email: payload.contact.email,
        phone: payload.contact.phone,
      },
    });

    const submissionData: IodLeadSubmissionData = {
      answers: payload.answers,
      labels: {
        branza: iodSectorLabels[payload.answers.branza],
        skala: iodScaleLabels[payload.answers.skala],
      },
      result,
      contact: payload.contact,
      consents: {
        privacy: true,
        marketing: payload.contact.marketingConsent,
      },
      source: {
        ...(payload.source ?? {}),
        ...meta,
      },
      lead: {
        source: "Landing / Checker IOD",
        stage: "Nowy",
        owner,
        value: result.leadValue,
        hot: result.hot,
      },
      submittedAt: new Date().toISOString(),
      formVersion: "iod-checker-v1",
    };

    const submission = await tx.formSubmission.create({
      data: {
        organizationId: organization.id,
        formType: IOD_LEAD_FORM_TYPE,
        status: "SUBMITTED",
        data: toJsonObject(submissionData),
      },
    });

    return { organization, submission };
  });

  return {
    leadId: created.submission.id,
    organizationId: created.organization.id,
    result,
  };
}

export async function listIodCrmLeads(limit = 50) {
  const prisma = getPrisma();
  const submissions = await prisma.formSubmission.findMany({
    where: {
      formType: IOD_LEAD_FORM_TYPE,
      status: {
        in: ["SUBMITTED", "PROCESSING", "COMPLETED"],
      },
    },
    include: {
      organization: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
  });

  return submissions.map(mapSubmissionToCrmLead);
}

export function mapSubmissionToCrmLead(submission: SubmissionWithOrganization) {
  const data = readSubmissionData(submission.data);
  const level = data.result?.level ?? "verification";
  const owner = data.lead?.owner ?? pickLeadOwner(level);
  const value = data.lead?.value ?? estimateFallbackValue(level);

  return {
    id: submission.id,
    company: submission.organization.name,
    industry: data.labels?.branza ?? "Nie wskazano",
    source: data.lead?.source ?? "Landing / Checker IOD",
    value,
    stage: data.lead?.stage ?? "Nowy",
    owner,
    lastActivity: formatRelativeActivity(submission.createdAt),
    hot: data.lead?.hot ?? level === "required",
  };
}

function readSubmissionData(value: unknown): Partial<IodLeadSubmissionData> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Partial<IodLeadSubmissionData>;
}

function pickLeadOwner(level: IodResultLevel) {
  if (level === "required") return "AK";
  if (level === "verification") return "MW";
  return "JZ";
}

function estimateFallbackValue(level: IodResultLevel) {
  if (level === "required") return 8900;
  if (level === "verification") return 5900;
  return 2900;
}

function toJsonObject(value: IodLeadSubmissionData) {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonObject;
}

function formatRelativeActivity(date: Date) {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.max(0, Math.floor(diffMs / 86_400_000));

  if (diffDays === 0) return "dzisiaj";
  if (diffDays === 1) return "wczoraj";
  if (diffDays < 7) return `${diffDays} dni temu`;

  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "short",
  }).format(date);
}
