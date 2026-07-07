import "server-only";

import { Prisma, type FormSubmission, type Organization } from "@prisma/client";

import {
  isHotComplianceLead,
  mapIodObligationStatusToResultLevel,
  mapLandingAnswersToObligationInput,
  resultLabelForComplianceStatus,
  type IodResultLevel,
} from "@/lib/iod-checker";
import type { IodObligationOutput, IodObligationStatus } from "@/lib/iod-obligation-checker";
import { evaluateIodObligation } from "@/lib/iod-obligation-checker";
import { getPrisma } from "@/server/db/prisma";
import { type IodLeadPayload, iodLeadPayloadSchema } from "@/server/leads/iod-schema";
import type { PublicRequestMetadata } from "@/server/security/request-metadata";

export const IOD_LEAD_FORM_TYPE = "iod_checker_lead";
const DEDUPE_WINDOW_MS = 60 * 60 * 1000;

export { iodLeadPayloadSchema };

type IodLeadSubmissionData = {
  answers: Record<string, string>;
  complianceResult: IodObligationOutput;
  contact: IodLeadPayload["contact"];
  consents: {
    privacy: true;
    marketing: boolean;
  };
  source: {
    campaign?: string;
    page?: string;
    placement?: string;
    referrer?: string;
    utmCampaign?: string;
    utmMedium?: string;
    utmSource?: string;
  } & PublicRequestMetadata;
  lead: {
    source: string;
    stage: "Nowy";
    owner: "AK" | "MW" | "JZ";
    value: number;
    hot: boolean;
  };
  submittedAt: string;
  formVersion: string;
  result?: {
    level: IodResultLevel;
    leadValue: number;
    hot: boolean;
  };
  labels?: {
    branza?: string;
  };
};

type SubmissionWithOrganization = FormSubmission & {
  organization: Organization;
};

export type RequestLeadMeta = PublicRequestMetadata;

export async function createIodLead(payload: IodLeadPayload, meta: RequestLeadMeta) {
  const prisma = getPrisma();
  const complianceResult = evaluateIodObligation(mapLandingAnswersToObligationInput(payload.answers, payload.contact.company));
  const result = buildLeadResult(complianceResult);
  const owner = pickLeadOwner(result.level);
  const dedupeCutoff = new Date(Date.now() - DEDUPE_WINDOW_MS);
  const email = payload.contact.email.toLowerCase();

  const existingSubmission = await prisma.formSubmission.findFirst({
    orderBy: { createdAt: "desc" },
    select: { id: true },
    where: {
      createdAt: { gte: dedupeCutoff },
      data: {
        path: ["contact", "email"],
        equals: email,
      },
      formType: IOD_LEAD_FORM_TYPE,
    },
  });

  if (existingSubmission) {
    return { created: false };
  }

  const created = await prisma.$transaction(async (tx) => {
    const organization = await tx.organization.create({
      data: {
        name: payload.contact.company,
        email,
        phone: payload.contact.phone,
      },
    });

    const submissionData: IodLeadSubmissionData = {
      answers: payload.answers,
      complianceResult,
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

    return { organization, submission };
  });

  return {
    created: true,
    internalLeadId: created.submission.id,
    internalOrganizationId: created.organization.id,
    result,
    complianceResult,
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
  const complianceStatus = data.complianceResult?.obligation_status;
  const level = data.result?.level ?? fallbackLevelForComplianceStatus(complianceStatus);
  const owner = data.lead?.owner ?? pickLeadOwner(level);
  const value = data.lead?.value ?? estimateFallbackValue(level);
  const hot = data.lead?.hot ?? level === "required";

  return {
    id: submission.id,
    company: submission.organization.name,
    industry: data.labels?.branza ?? data.answers?.branza ?? "Nie wskazano",
    source: data.lead?.source ?? "Landing / Checker IOD",
    resultLabel: resultLabelForComplianceStatus(complianceStatus) ?? (hot ? "IOD wymagany" : "Do weryfikacji"),
    value,
    stage: data.lead?.stage ?? "Nowy",
    owner,
    lastActivity: formatRelativeActivity(submission.createdAt),
    hot,
  };
}

function buildLeadResult(assessment: IodObligationOutput) {
  const level = mapIodObligationStatusToResultLevel(assessment.obligation_status);
  const leadValue = estimateLeadValue(Math.min(assessment.scale_result.score, 8), level);

  return {
    hot: isHotComplianceLead(assessment),
    leadValue,
    level,
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

function estimateLeadValue(score: number, level: IodResultLevel) {
  return estimateFallbackValue(level) + Math.min(score, 8) * 500;
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
