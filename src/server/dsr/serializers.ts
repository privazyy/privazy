import "server-only";

import type { Prisma } from "@prisma/client";

import { deadlineState, daysUntil } from "@/server/dsr/deadline";

const dsrInclude = {
  organization: { select: { id: true, name: true, email: true, status: true } },
  reportedBy: { select: { id: true, name: true, email: true } },
  assignedTo: { select: { id: true, name: true, email: true } },
  activities: {
    orderBy: { createdAt: "desc" as const },
    include: { actor: { select: { id: true, name: true, email: true } } },
  },
  tasks: {
    orderBy: [{ status: "asc" as const }, { dueAt: "asc" as const }],
    include: {
      assignedTo: { select: { id: true, name: true, email: true } },
      createdBy: { select: { id: true, name: true, email: true } },
    },
  },
} satisfies Prisma.DataSubjectRequestInclude;

export const dsrDetailInclude = dsrInclude;

export type DsrRecord = Prisma.DataSubjectRequestGetPayload<{ include: typeof dsrDetailInclude }>;

export function serializeDsrListItem(request: DsrRecord) {
  return {
    id: request.id,
    organization: request.organization,
    requesterName: request.requesterName,
    requesterEmail: request.requesterEmail,
    type: request.type,
    status: request.status,
    priority: request.priority,
    receivedAt: request.receivedAt,
    dueAt: request.dueAt,
    deadline: {
      daysUntil: daysUntil(request.dueAt),
      state: deadlineState(request.dueAt),
    },
    verificationStatus: request.verificationStatus,
    assignedTo: request.assignedTo,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
  };
}

export function serializeDsrDetail(request: DsrRecord, scope: "crm" | "portal") {
  const publicActivities = scope === "portal" ? request.activities.filter((activity) => activity.visibility === "PUBLIC") : request.activities;

  return {
    ...serializeDsrListItem(request),
    requesterPhone: request.requesterPhone,
    relationship: request.relationship,
    requestDescription: request.requestDescription,
    requestChannel: request.requestChannel,
    additionalInformation: request.additionalInformation,
    extensionUntil: request.extensionUntil,
    extensionReason: scope === "crm" ? request.extensionReason : undefined,
    closedAt: request.closedAt,
    verificationMethod: scope === "crm" ? request.verificationMethod : undefined,
    verificationNote: scope === "crm" ? request.verificationNote : undefined,
    verifiedAt: request.verifiedAt,
    responseSummary: request.responseSummary,
    responseDraft: scope === "crm" ? request.responseDraft : undefined,
    responseDecision: request.responseDecision,
    responsePreparedAt: request.responsePreparedAt,
    responseSentAt: request.responseSentAt,
    decisionRationale: scope === "crm" ? request.decisionRationale : undefined,
    activities: publicActivities.map((activity) => ({
      id: activity.id,
      actor: activity.actor,
      type: activity.type,
      visibility: activity.visibility,
      title: activity.title,
      note: activity.note,
      metadata: scope === "crm" ? activity.metadata : undefined,
      createdAt: activity.createdAt,
    })),
    tasks:
      scope === "crm"
        ? request.tasks.map((task) => ({
            id: task.id,
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            dueAt: task.dueAt,
            assignedTo: task.assignedTo,
            createdBy: task.createdBy,
            completedAt: task.completedAt,
            createdAt: task.createdAt,
            updatedAt: task.updatedAt,
          }))
        : undefined,
  };
}
