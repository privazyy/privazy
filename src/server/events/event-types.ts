export const EVENT_VERSION = "v1";

export const eventTypes = [
  "lead.iod.submitted.v1",
  "lead.contact.submitted.v1",
  "lead.assigned.v1",
  "lead.status.changed.v1",
  "order.created.v1",
  "order.payment.pending.v1",
  "order.payment.succeeded.v1",
  "order.payment.failed.v1",
  "order.cancelled.v1",
  "payment.webhook.received.v1",
  "payment.reconciliation.failed.v1",
  "invoice.issue.requested.v1",
  "invoice.issued.v1",
  "invoice.failed.v1",
  "document.input.saved.v1",
  "document.input.submitted.v1",
  "document.generate.requested.v1",
  "document.generate.succeeded.v1",
  "document.generate.failed.v1",
  "document.review.required.v1",
  "document.review.approved.v1",
  "document.downloaded.v1",
  "crm.task.created.v1",
  "crm.task.due_soon.v1",
  "crm.task.overdue.v1",
  "crm.note.created.v1",
  "breach.created.v1",
  "breach.deadline.24h.v1",
  "breach.deadline.6h.v1",
  "breach.overdue.v1",
  "breach.status.changed.v1",
  "dsr.created.v1",
  "dsr.deadline.7d.v1",
  "dsr.deadline.2d.v1",
  "dsr.overdue.v1",
  "dsr.status.changed.v1",
  "client.message.created.v1",
  "client.task.completed.v1",
  "blog.post.published.v1",
  "newsletter.subscriber.created.v1",
  "newsletter.double_opt_in.requested.v1",
  "newsletter.unsubscribe.v1",
  "report.daily_crm.requested.v1",
  "report.weekly_operations.requested.v1",
] as const;

export type WorkflowEventType = (typeof eventTypes)[number];

export type WorkflowEventPayload = {
  actorId?: string | null;
  entityId?: string | null;
  entityType?: string | null;
  organizationId?: string | null;
  resourceId?: string | null;
  source?: string | null;
  [key: string]: unknown;
};

export type EventCatalogEntry = {
  critical: boolean;
  description: string;
  eventType: WorkflowEventType;
  owner: "ADMIN" | "LAWYER" | "OPERATOR" | "SYSTEM";
  pii: "none" | "minimal";
  trigger: string;
};

export const eventCatalog: EventCatalogEntry[] = eventTypes.map((eventType) => ({
  critical: eventType.includes("payment") || eventType.includes("document.generate"),
  description: eventType.replaceAll(".", " "),
  eventType,
  owner: eventType.startsWith("breach.") || eventType.startsWith("dsr.") ? "LAWYER" : "OPERATOR",
  pii: "minimal",
  trigger: "Application event",
}));

export function isWorkflowEventType(value: string): value is WorkflowEventType {
  return (eventTypes as readonly string[]).includes(value);
}

export function eventIdempotencyKey(input: {
  eventType: WorkflowEventType;
  resourceId: string;
  scope?: string;
}) {
  return [input.eventType, input.resourceId, input.scope].filter(Boolean).join(":");
}
