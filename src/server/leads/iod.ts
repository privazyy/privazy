import "server-only";

import { Prisma, type FormSubmission, type Organization } from "@prisma/client";
import { z } from "zod";

import {
  calculateIodResult,
  iodScaleLabels,
  iodSectorLabels,
  mapLandingAnswersToObligationInput,
  resultLabelForComplianceStatus,
  type IodScale,
  type IodCheckerAnswers,
  type IodResultLevel,
  type IodSector,
  type IodTriState,
} from "@/lib/iod-checker";
import { evaluateIodObligation } from "@/lib/iod-obligation-checker";
import type { IodObligationOutput, IodObligationStatus } from "@/lib/iod-obligation-checker";
import { getPrisma } from "@/server/db/prisma";

export const IOD_LEAD_FORM_TYPE = "iod_checker_lead";

const optionalText = (max = 160) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => (value ? value : undefined));

const checkerAnswersSchema = z
  .record(z.string().trim().max(80), z.string().trim().max(240))
  .refine((value) => Object.keys(value).length > 0, "Checker answers are required");

const iodLeadUtmSchema = z
  .record(z.string().trim().max(40), z.string().trim().max(240))
  .optional()
  .default({});

export const iodLeadPayloadSchema = z.object({
  answers: checkerAnswersSchema,
  result: z.unknown().optional(),
  complianceResult: z.unknown().optional(),
  contact: z
    .object({
      company: optionalText(160),
      nip: optionalText(24),
      employees: optionalText(48),
      name: z.string().trim().min(2).max(120),
      email: z.email().max(180),
      phone: optionalText(48),
      consent: z.boolean().optional(),
      privacyConsent: z.boolean().optional(),
      marketingConsent: z.boolean().optional().default(false),
    })
    .refine((value) => value.privacyConsent === true || value.consent === true, "Privacy consent is required")
    .transform((value) => ({
      ...value,
      privacyConsent: value.privacyConsent ?? value.consent ?? false,
    })),
  message: optionalText(1200),
  source: z
    .object({
      page: optionalText(180),
      placement: optionalText(120),
      campaign: optionalText(120),
      subject: optionalText(160),
      serviceSlug: optionalText(80),
      industrySlug: optionalText(80),
      utm: iodLeadUtmSchema,
    })
    .optional(),
  security: z
    .object({
      turnstileToken: optionalText(1200),
      website: optionalText(200),
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
  answers: Record<string, string>;
  normalizedAnswers: IodCheckerAnswers;
  labels: {
    branza: string;
    skala: string;
  };
  result: ReturnType<typeof calculateIodResult>;
  complianceResult: IodObligationOutput;
  clientResult?: unknown;
  clientComplianceResult?: unknown;
  contact: IodLeadPayload["contact"];
  message?: string;
  consents: {
    privacy: true;
    marketing: boolean;
  };
  source: {
    page?: string;
    placement?: string;
    campaign?: string;
    subject?: string;
    serviceSlug?: string;
    industrySlug?: string;
    utm?: Record<string, string>;
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
  const companyName = payload.contact.company ?? payload.contact.name;
  const normalizedAnswers = normalizeLandingAnswers(payload.answers);
  const complianceResult = evaluateIodObligation(mapLandingAnswersToObligationInput(payload.answers, companyName));
  const result = calculateIodResult(normalizedAnswers, complianceResult);
  const owner = pickLeadOwner(result.level);

  const created = await prisma.$transaction(async (tx) => {
    const organization = await tx.organization.create({
      data: {
        name: companyName,
        nip: payload.contact.nip,
        email: payload.contact.email,
        phone: payload.contact.phone,
      },
    });

    const submissionData: IodLeadSubmissionData = {
      answers: payload.answers,
      normalizedAnswers,
      labels: {
        branza: iodSectorLabels[normalizedAnswers.branza],
        skala: iodScaleLabels[normalizedAnswers.skala],
      },
      result,
      complianceResult,
      clientResult: payload.result,
      clientComplianceResult: payload.complianceResult,
      contact: payload.contact,
      message: payload.message,
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
      formVersion: "iod-checker-v2",
    };

    const submission = await tx.formSubmission.create({
      data: {
        organizationId: organization.id,
        formType: IOD_LEAD_FORM_TYPE,
        status: "SUBMITTED",
        data: toJsonObject(submissionData),
      },
    });

    const lead = await tx.lead.create({
      data: {
        source: "IOD_CHECKER",
        status: "NEW",
        priority: result.hot ? "URGENT" : result.level === "verification" ? "HIGH" : "NORMAL",
        companyName: payload.contact.company,
        fullName: payload.contact.name,
        email: payload.contact.email.toLowerCase(),
        phone: payload.contact.phone,
        nip: payload.contact.nip,
        industry: iodSectorLabels[payload.answers.branza],
        companySize: payload.contact.employees ?? iodScaleLabels[payload.answers.skala],
        estimatedValue: result.leadValue,
        consentMarketing: payload.contact.marketingConsent,
        consentPrivacy: true,
        consentContact: true,
        iodCheckerResult: complianceResult.obligation_status,
        iodCheckerAnswersSnapshot: toJsonObject(payload.answers),
        sourceDetails: toJsonObject({
          page: payload.source?.page,
          placement: payload.source?.placement,
          campaign: payload.source?.campaign,
          complianceStatus: complianceResult.obligation_status,
          resultLevel: result.level,
        }),
        formSubmissionId: submission.id,
      },
    });

    await tx.auditLog.create({
      data: {
        organizationId: organization.id,
        action: "crm.lead.public_created",
        entityType: "Lead",
        entityId: lead.id,
        metadata: {
          source: "IOD_CHECKER",
          formSubmissionId: submission.id,
        },
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
      },
    });

    return { lead, organization, submission };
  });

  return {
    leadId: created.lead.id,
    organizationId: created.organization.id,
    result,
    complianceResult,
  };
}

function normalizeLandingAnswers(answers: Record<string, string>): IodCheckerAnswers {
  return {
    publiczny: mapPublicAnswer(answers.organizacja),
    branza: mapSectorAnswer(answers.branza, answers.organizacja),
    monitoring: mapMonitoringAnswer(answers.monitoring, answers.monitoring_regularny),
    wrazliwe: mapSpecialCategoryAnswer(answers.kategorie, answers.branza),
    skala: mapScaleAnswer(answers.liczba_osob, answers.pracownicy),
    iod: mapTriStateAnswer(answers.ocena_wewnetrzna),
  };
}

function mapPublicAnswer(value?: string): "tak" | "nie" {
  const normalized = normalizeText(value);
  return normalized.includes("publiczny") || normalized.includes("sad") || normalized.includes("trybunal") ? "tak" : "nie";
}

function mapSectorAnswer(industry?: string, organization?: string): IodSector {
  const normalizedIndustry = normalizeText(industry);
  const normalizedOrganization = normalizeText(organization);

  if (normalizedOrganization.includes("publiczny")) return "publiczny";
  if (normalizedIndustry.includes("medycz")) return "zdrowie";
  if (normalizedIndustry.includes("eduk")) return "edukacja";
  if (normalizedIndustry.includes("e-commerce") || normalizedIndustry.includes("commerce")) return "ecommerce";
  if (normalizedIndustry.includes("it") || normalizedIndustry.includes("saas")) return "it";
  if (normalizedIndustry.includes("hr") || normalizedIndustry.includes("rekrut")) return "marketing";
  if (normalizedIndustry.includes("kancel")) return "inne";

  return "inne";
}

function mapMonitoringAnswer(monitoring?: string, regularity?: string): IodTriState {
  const normalizedMonitoring = normalizeText(monitoring);
  const normalizedRegularity = normalizeText(regularity);

  if (normalizedMonitoring.includes("nie wiem") || normalizedRegularity.includes("nie wiem")) return "nie_wiem";
  if (!monitoring || normalizedMonitoring.includes("brak")) return "nie";
  if (normalizedRegularity.includes("okazjonal")) return "nie";

  return "tak";
}

function mapSpecialCategoryAnswer(category?: string, industry?: string): IodTriState {
  const normalizedCategory = normalizeText(category);
  const normalizedIndustry = normalizeText(industry);

  if (normalizedCategory.includes("nie wiem")) return "nie_wiem";
  if (normalizedIndustry.includes("medycz")) return "tak";
  if (
    normalizedCategory.includes("szczegol") ||
    normalizedCategory.includes("karal") ||
    normalizedCategory.includes("biometr") ||
    normalizedCategory.includes("zdrow")
  ) {
    return "tak";
  }

  return "nie";
}

function mapScaleAnswer(personCount?: string, employees?: string): IodScale {
  const normalizedCount = normalizeText(personCount);
  const normalizedEmployees = normalizeText(employees);

  if (normalizedCount.includes("100000+")) return "xl";
  if (normalizedCount.includes("10001") || normalizedEmployees.includes("250")) return "l";
  if (normalizedCount.includes("1001") || normalizedEmployees.includes("50-249")) return "m";

  return "s";
}

function mapTriStateAnswer(value?: string): IodTriState {
  const normalized = normalizeText(value);
  if (normalized === "tak") return "tak";
  if (normalized === "nie") return "nie";
  return "nie_wiem";
}

function normalizeText(value?: string) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
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
  const complianceStatus = data.complianceResult?.obligation_status;
  const level = data.result?.level ?? fallbackLevelForComplianceStatus(complianceStatus);
  const owner = data.lead?.owner ?? pickLeadOwner(level);
  const value = data.lead?.value ?? estimateFallbackValue(level);
  const hot = data.lead?.hot ?? level === "required";

  return {
    id: submission.id,
    company: submission.organization.name,
    industry: data.labels?.branza ?? "Nie wskazano",
    source: data.lead?.source ?? "Landing / Checker IOD",
    resultLabel: resultLabelForComplianceStatus(complianceStatus) ?? (hot ? "IOD wymagany" : "Do weryfikacji"),
    value,
    stage: data.lead?.stage ?? "Nowy",
    owner,
    lastActivity: formatRelativeActivity(submission.createdAt),
    hot,
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

function fallbackLevelForComplianceStatus(status?: IodObligationStatus): IodResultLevel {
  if (status === "required" || status === "likely_required") return "required";
  if (status === "not_required" || status === "likely_not_required") return "not_required";
  return "verification";
}

function estimateFallbackValue(level: IodResultLevel) {
  if (level === "required") return 8900;
  if (level === "verification") return 5900;
  return 2900;
}

function toJsonObject(value: object) {
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
