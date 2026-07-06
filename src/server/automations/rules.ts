import "server-only";

import type { UserRole } from "@prisma/client";

import { getPrisma } from "@/server/db/prisma";
import type { WorkflowEventType } from "@/server/events/event-types";

export type AutomationRuleDefinition = {
  critical?: boolean;
  description: string;
  key: string;
  maxAttempts?: number;
  name: string;
  ownerRole: UserRole;
  triggerEvent: WorkflowEventType;
};

export const automationRuleDefinitions: AutomationRuleDefinition[] = [
  { critical: true, description: "Creates post-payment work items and notifications without changing payment truth.", key: "order-payment-succeeded", name: "Payment succeeded follow-up", ownerRole: "OPERATOR", triggerEvent: "order.payment.succeeded.v1" },
  { description: "Alerts CRM when payment failed.", key: "order-payment-failed", name: "Payment failed follow-up", ownerRole: "OPERATOR", triggerEvent: "order.payment.failed.v1" },
  { critical: true, description: "Runs document generation worker and records success or failure.", key: "document-generate", name: "Document generation", ownerRole: "OPERATOR", triggerEvent: "document.generate.requested.v1" },
  { description: "Creates portal/CRM notifications when generated document is ready.", key: "document-ready", name: "Document ready notification", ownerRole: "OPERATOR", triggerEvent: "document.generate.succeeded.v1" },
  { description: "Creates internal task for failed document generation.", key: "document-failed", name: "Document generation failure alert", ownerRole: "OPERATOR", triggerEvent: "document.generate.failed.v1" },
  { description: "Creates breach deadline tasks and internal alerts.", key: "breach-deadline", name: "Breach deadline reminders", ownerRole: "LAWYER", triggerEvent: "breach.deadline.24h.v1" },
  { description: "Creates DSR deadline tasks and internal alerts.", key: "dsr-deadline", name: "DSR deadline reminders", ownerRole: "LAWYER", triggerEvent: "dsr.deadline.7d.v1" },
  { description: "Sends double opt-in foundation email without campaigns.", key: "newsletter-double-opt-in", name: "Newsletter double opt-in", ownerRole: "OPERATOR", triggerEvent: "newsletter.subscriber.created.v1" },
  { description: "Creates aggregate operations summaries.", key: "operations-reports", name: "Operations reports", ownerRole: "ADMIN", triggerEvent: "report.daily_crm.requested.v1" },
];

export async function ensureAutomationRule(definition: AutomationRuleDefinition) {
  return getPrisma().automationRule.upsert({
    create: {
      critical: Boolean(definition.critical),
      description: definition.description,
      key: definition.key,
      maxAttempts: definition.maxAttempts ?? 3,
      name: definition.name,
      ownerRole: definition.ownerRole,
      triggerEvent: definition.triggerEvent,
    },
    update: {
      critical: Boolean(definition.critical),
      description: definition.description,
      maxAttempts: definition.maxAttempts ?? 3,
      name: definition.name,
      ownerRole: definition.ownerRole,
      triggerEvent: definition.triggerEvent,
    },
    where: { key: definition.key },
  });
}

export async function getRuleForEvent(eventType: WorkflowEventType) {
  const definition = automationRuleDefinitions.find((rule) => rule.triggerEvent === eventType);
  if (!definition) return null;
  return ensureAutomationRule(definition);
}
