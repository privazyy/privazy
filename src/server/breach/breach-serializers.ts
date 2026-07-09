import "server-only";

import type { Prisma } from "@prisma/client";

import { describeBreachDeadline } from "@/server/breach/breach-deadline";

export const breachListInclude = {
  organization: { select: { id: true, name: true, email: true, phone: true } },
  reportedBy: { select: { id: true, name: true, email: true } },
  assignedTo: { select: { id: true, name: true, email: true, role: true } },
  _count: { select: { activities: true, tasks: true } },
} satisfies Prisma.DataBreachIncidentInclude;

export const breachDetailInclude = {
  ...breachListInclude,
  activities: {
    orderBy: { createdAt: "desc" as const },
    include: { actor: { select: { id: true, name: true, email: true, role: true } } },
  },
  tasks: {
    orderBy: [{ status: "asc" as const }, { dueAt: "asc" as const }],
    include: {
      assignedTo: { select: { id: true, name: true, email: true, role: true } },
      createdBy: { select: { id: true, name: true, email: true, role: true } },
    },
  },
} satisfies Prisma.DataBreachIncidentInclude;

type BreachListRecord = Prisma.DataBreachIncidentGetPayload<{ include: typeof breachListInclude }>;
type BreachDetailRecord = Prisma.DataBreachIncidentGetPayload<{ include: typeof breachDetailInclude }>;

export function serializeBreachListItem(incident: BreachListRecord) {
  return {
    id: incident.id,
    organization: incident.organization,
    reportedBy: incident.reportedBy,
    assignedTo: incident.assignedTo,
    title: incident.title,
    status: incident.status,
    severity: incident.severity,
    riskLevel: incident.riskLevel,
    occurredAt: incident.occurredAt,
    discoveredAt: incident.discoveredAt,
    reportedAt: incident.reportedAt,
    authorityNotificationDeadlineAt: incident.authorityNotificationDeadlineAt,
    closedAt: incident.closedAt,
    deadline: describeBreachDeadline(incident.discoveredAt),
    authorityNotificationRequired: incident.authorityNotificationRequired,
    dataSubjectsNotificationRequired: incident.dataSubjectsNotificationRequired,
    counts: incident._count,
    createdAt: incident.createdAt,
    updatedAt: incident.updatedAt,
  };
}

export function serializeBreachDetail(incident: BreachDetailRecord, options: { includeInternal: boolean }) {
  const activities = incident.activities.filter((activity) => options.includeInternal || activity.visibility === "PUBLIC");

  return {
    ...serializeBreachListItem(incident),
    description: incident.description,
    affectedDataCategories: incident.affectedDataCategories,
    affectedDataSubjectCategories: incident.affectedDataSubjectCategories,
    approximateAffectedSubjects: incident.approximateAffectedSubjects,
    cause: incident.cause,
    consequences: incident.consequences,
    measuresTaken: incident.measuresTaken,
    measuresPlanned: incident.measuresPlanned,
    contactName: incident.contactName,
    contactEmail: incident.contactEmail,
    contactPhone: incident.contactPhone,
    decisionRationale: options.includeInternal ? incident.decisionRationale : null,
    riskAssessment: {
      specialCategoryData: incident.specialCategoryData,
      childrenData: incident.childrenData,
      largeScale: incident.largeScale,
      identityTheftRisk: incident.identityTheftRisk,
      encryptedData: incident.encryptedData,
      accessRecovered: incident.accessRecovered,
      mitigationMeasuresApplied: incident.mitigationMeasuresApplied,
      suggestedRiskLevel: incident.suggestedRiskLevel,
    },
    puodoDraftData: {
      administrator: incident.organization.name,
      contact: [incident.organization.email, incident.organization.phone].filter(Boolean).join(" / ") || null,
      description: incident.description,
      approximateAffectedSubjects: incident.approximateAffectedSubjects,
      affectedDataCategories: incident.affectedDataCategories,
      affectedDataSubjectCategories: incident.affectedDataSubjectCategories,
      consequences: incident.consequences,
      measuresTaken: incident.measuresTaken,
      measuresPlanned: incident.measuresPlanned,
      deadlineAt: incident.authorityNotificationDeadlineAt,
    },
    timeline: activities.map((activity) => ({
      id: activity.id,
      type: activity.type,
      title: activity.title,
      body: activity.body,
      visibility: activity.visibility,
      actor: activity.actor,
      metadata: options.includeInternal ? activity.metadata : {},
      createdAt: activity.createdAt,
    })),
    tasks: options.includeInternal
      ? incident.tasks.map((task) => ({
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
      : [],
  };
}
