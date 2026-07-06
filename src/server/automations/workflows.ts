import "server-only";

import type { Prisma } from "@prisma/client";

import { buildIdempotencyKey, reminderIdempotencyKey } from "@/server/automations/idempotency";
import { createInternalNotification, createPortalNotification } from "@/server/automations/notifications";
import { runAutomation } from "@/server/automations/run";
import { getPrisma } from "@/server/db/prisma";
import { sendEmail } from "@/server/email/send-email";
import { emitEvent } from "@/server/events/emit-event";
import type { WorkflowEventType } from "@/server/events/event-types";
import { getInvoiceProvider } from "@/server/invoices";

type EventData = {
  actorId?: string | null;
  eventLogId?: string | null;
  idempotencyKey?: string | null;
  organizationId?: string | null;
  [key: string]: unknown;
};

export async function handleOrderCreated(data: EventData) {
  const orderId = String(data.orderId ?? "");
  const order = await getPrisma().order.findUnique({ where: { id: orderId } });
  if (!order) return { skipped: true };

  const result = await runAutomation({
    eventLogId: data.eventLogId as string | undefined,
    eventType: "order.created.v1",
    functionName: "order-created",
    idempotencyKey: buildIdempotencyKey(["run", "order-created", order.id]),
    organizationId: order.organizationId,
    task: async (tx) => {
      await createInternalNotification({
        body: `Zamowienie ${order.orderNumber} czeka na platnosc.`,
        entityId: order.id,
        entityType: "Order",
        organizationId: order.organizationId,
        title: "Nowe zamowienie",
        tx,
        type: "order.created",
      });
      return { orderId: order.id };
    },
  });

  if (!result.skipped) {
    await sendEmail({
      entityId: order.id,
      entityType: "Order",
      organizationId: order.organizationId,
      recipient: order.email,
      template: "order.created",
      templateInput: {
        orderNumber: order.orderNumber,
        statusUrl: orderStatusUrl(order.orderNumber, order.publicAccessToken),
      },
    });
  }

  return result;
}

export async function handlePaymentSucceeded(data: EventData) {
  const orderId = String(data.orderId ?? "");
  const prisma = getPrisma();
  const order = await prisma.order.findUnique({ include: { items: true }, where: { id: orderId } });
  if (!order) return { skipped: true };

  const result = await runAutomation({
    eventLogId: data.eventLogId as string | undefined,
    eventType: "order.payment.succeeded.v1",
    functionName: "payment-succeeded-follow-up",
    idempotencyKey: buildIdempotencyKey(["run", "payment-succeeded", order.id]),
    organizationId: order.organizationId,
    task: async (tx) => {
      await createInternalNotification({
        body: `Platnosc za ${order.orderNumber} potwierdzona. Przygotuj kolejne kroki.`,
        entityId: order.id,
        entityType: "Order",
        organizationId: order.organizationId,
        title: "Platnosc potwierdzona",
        tx,
        type: "order.payment.succeeded",
      });

      for (const item of order.items) {
        await createPortalNotification({
          body: `Uzupelnij dane dla: ${item.productName}.`,
          entityId: item.id,
          entityType: "OrderItem",
          organizationId: order.organizationId,
          title: "Formularz dokumentu do uzupelnienia",
          tx,
          type: "document.input_required",
        });
      }

      return { orderId: order.id, orderItemIds: order.items.map((item) => item.id) };
    },
  });

  if (!result.skipped) {
    await sendEmail({
      entityId: order.id,
      entityType: "Order",
      organizationId: order.organizationId,
      recipient: order.email,
      template: "payment.succeeded",
      templateInput: { orderNumber: order.orderNumber },
    });
    await emitEvent({
      eventType: "invoice.issue.requested.v1",
      idempotencyKey: buildIdempotencyKey(["invoice-issue", order.id]),
      organizationId: order.organizationId,
      payload: { orderId: order.id, organizationId: order.organizationId },
      source: "payment-succeeded-workflow",
    });
  }

  return result;
}

export async function handlePaymentFailed(data: EventData) {
  const orderId = String(data.orderId ?? "");
  const order = await getPrisma().order.findUnique({ where: { id: orderId } });
  if (!order) return { skipped: true };

  const result = await runAutomation({
    eventLogId: data.eventLogId as string | undefined,
    eventType: "order.payment.failed.v1",
    functionName: "payment-failed-follow-up",
    idempotencyKey: buildIdempotencyKey(["run", "payment-failed", order.id]),
    organizationId: order.organizationId,
    task: async (tx) => {
      await createInternalNotification({
        body: `Nieudana platnosc za ${order.orderNumber}.`,
        entityId: order.id,
        entityType: "Order",
        organizationId: order.organizationId,
        title: "Platnosc nieudana",
        tx,
        type: "order.payment.failed",
      });
      return { orderId: order.id };
    },
  });

  if (!result.skipped) {
    await sendEmail({
      entityId: order.id,
      entityType: "Order",
      organizationId: order.organizationId,
      recipient: order.email,
      template: "payment.failed",
      templateInput: {
        orderNumber: order.orderNumber,
        statusUrl: orderStatusUrl(order.orderNumber, order.publicAccessToken),
      },
    });
  }

  return result;
}

export async function handleInvoiceIssueRequested(data: EventData) {
  const orderId = String(data.orderId ?? "");
  const result = await runAutomation({
    eventLogId: data.eventLogId as string | undefined,
    eventType: "invoice.issue.requested.v1",
    functionName: "invoice-issue-requested",
    idempotencyKey: buildIdempotencyKey(["run", "invoice-issue", orderId]),
    organizationId: data.organizationId as string | undefined,
    task: async () => {
      const invoice = await getInvoiceProvider().issueInvoice({ orderId });
      return { invoiceId: invoice.invoiceId, status: invoice.status };
    },
  });

  if ("output" in result && result.output && typeof result.output === "object" && "invoiceId" in result.output) {
    await emitEvent({
      eventType: "invoice.issued.v1",
      idempotencyKey: buildIdempotencyKey(["invoice-issued", String(result.output.invoiceId)]),
      organizationId: data.organizationId as string | undefined,
      payload: { invoiceId: String(result.output.invoiceId), orderId },
      source: "invoice-workflow",
    });
  }

  return result;
}

export async function handleDocumentSucceeded(data: EventData) {
  const documentId = String(data.generatedDocumentId ?? "");
  const document = await getPrisma().generatedDocument.findUnique({
    include: { organization: true },
    where: { id: documentId },
  });
  if (!document) return { skipped: true };

  const result = await runAutomation({
    eventLogId: data.eventLogId as string | undefined,
    eventType: "document.generate.succeeded.v1",
    functionName: "document-succeeded-follow-up",
    idempotencyKey: buildIdempotencyKey(["run", "document-succeeded", document.id]),
    organizationId: document.organizationId,
    task: async (tx) => {
      await createPortalNotification({
        body: "Dokument jest gotowy do bezpiecznego pobrania po zalogowaniu.",
        entityId: document.id,
        entityType: "GeneratedDocument",
        organizationId: document.organizationId,
        title: "Dokument gotowy",
        tx,
        type: "document.ready",
      });
      return { generatedDocumentId: document.id };
    },
  });

  if (!result.skipped && document.organization.email) {
    await sendEmail({
      entityId: document.id,
      entityType: "GeneratedDocument",
      organizationId: document.organizationId,
      recipient: document.organization.email,
      template: "document.ready",
    });
  }

  return result;
}

export async function handleDocumentFailed(data: EventData) {
  const jobId = String(data.jobId ?? "");
  const job = await getPrisma().documentGenerationJob.findUnique({ where: { id: jobId } });
  if (!job) return { skipped: true };

  return runAutomation({
    eventLogId: data.eventLogId as string | undefined,
    eventType: "document.generate.failed.v1",
    functionName: "document-failed-follow-up",
    idempotencyKey: buildIdempotencyKey(["run", "document-failed", job.id]),
    organizationId: job.organizationId,
    task: async (tx) => {
      await ensureTask(tx, {
        description: job.errorMessage ?? "Generator dokumentu zwrocil blad.",
        entityId: job.id,
        entityType: "DocumentGenerationJob",
        organizationId: job.organizationId,
        priority: "HIGH",
        title: "Sprawdz blad generowania dokumentu",
      });
      await createInternalNotification({
        body: job.errorMessage,
        entityId: job.id,
        entityType: "DocumentGenerationJob",
        organizationId: job.organizationId,
        title: "Blad generowania dokumentu",
        tx,
        type: "document.generate.failed",
      });
      return { jobId: job.id };
    },
  });
}

export async function emitDeadlineEvents() {
  await Promise.all([emitBreachDeadlineEvents(), emitDsrDeadlineEvents(), emitTaskDeadlineEvents()]);
}

export async function emitBreachDeadlineEvents() {
  const now = Date.now();
  const breaches = await getPrisma().breachIncident.findMany({
    where: {
      authorityDueAt: { not: null },
      status: { notIn: ["CLOSED", "ARCHIVED"] },
    },
  });

  for (const breach of breaches) {
    const dueAt = breach.authorityDueAt?.getTime();
    if (!dueAt) continue;
    const hours = (dueAt - now) / 3_600_000;
    const window = hours < 0 ? "overdue" : hours <= 6 ? "6h" : hours <= 24 ? "24h" : null;
    if (!window) continue;

    const eventType = (`breach.${window === "overdue" ? "overdue" : `deadline.${window}`}.v1`) as WorkflowEventType;
    await emitEvent({
      eventType,
      idempotencyKey: reminderIdempotencyKey({ resourceId: breach.id, type: "breach", window }),
      organizationId: breach.organizationId,
      payload: { entityId: breach.id, entityType: "BreachIncident", organizationId: breach.organizationId, resourceId: breach.id, window },
      source: "deadline-scan",
    });
  }
}

export async function emitDsrDeadlineEvents() {
  const now = Date.now();
  const requests = await getPrisma().dataSubjectRequest.findMany({
    where: { status: { notIn: ["CLOSED", "ARCHIVED"] } },
  });

  for (const request of requests) {
    const days = (request.dueAt.getTime() - now) / 86_400_000;
    const window = days < 0 ? "overdue" : days <= 2 ? "2d" : days <= 7 ? "7d" : null;
    if (!window) continue;

    const eventType = (`dsr.${window === "overdue" ? "overdue" : `deadline.${window}`}.v1`) as WorkflowEventType;
    await emitEvent({
      eventType,
      idempotencyKey: reminderIdempotencyKey({ resourceId: request.id, type: "dsr", window }),
      organizationId: request.organizationId,
      payload: { entityId: request.id, entityType: "DataSubjectRequest", organizationId: request.organizationId, resourceId: request.id, window },
      source: "deadline-scan",
    });
  }
}

export async function emitTaskDeadlineEvents() {
  const now = Date.now();
  const soon = new Date(now + 24 * 60 * 60 * 1000);
  const tasks = await getPrisma().crmTask.findMany({
    where: {
      dueAt: { lte: soon },
      status: { notIn: ["DONE", "CANCELLED"] },
    },
  });

  for (const task of tasks) {
    const window = task.dueAt && task.dueAt.getTime() < now ? "overdue" : "due_soon";
    await emitEvent({
      eventType: window === "overdue" ? "crm.task.overdue.v1" : "crm.task.due_soon.v1",
      idempotencyKey: reminderIdempotencyKey({ resourceId: task.id, type: "task", window }),
      organizationId: task.organizationId,
      payload: { entityId: task.id, entityType: "CrmTask", organizationId: task.organizationId, resourceId: task.id, taskId: task.id, window },
      source: "deadline-scan",
    });
  }
}

export async function handleReminder(data: EventData, eventType: WorkflowEventType) {
  const entityId = String(data.entityId ?? data.resourceId ?? "");
  const entityType = String(data.entityType ?? "");
  const organizationId = data.organizationId as string | undefined;

  return runAutomation({
    eventLogId: data.eventLogId as string | undefined,
    eventType,
    functionName: "deadline-reminder",
    idempotencyKey: buildIdempotencyKey(["run", "deadline", eventType, entityId]),
    organizationId,
    task: async (tx) => {
      await createInternalNotification({
        body: `Reminder ${data.window ?? ""} dla ${entityType}.`,
        entityId,
        entityType,
        organizationId,
        title: eventType.includes("overdue") ? "Termin przekroczony" : "Termin blisko",
        tx,
        type: eventType,
      });
      await ensureTask(tx, {
        description: "Automatyczny reminder. Wymaga review osoby odpowiedzialnej, bez automatycznej decyzji prawnej.",
        entityId,
        entityType,
        organizationId,
        priority: eventType.includes("overdue") || eventType.includes("6h") ? "CRITICAL" : "HIGH",
        title: eventType.includes("dsr") ? "Sprawdz termin zadania osoby" : eventType.includes("breach") ? "Sprawdz termin naruszenia" : "Sprawdz termin zadania",
      });
      return { entityId, entityType };
    },
  });
}

export async function handleNewsletterSubscriberCreated(data: EventData) {
  const subscriberId = String(data.subscriberId ?? "");
  const subscriber = await getPrisma().newsletterSubscriber.findUnique({ where: { id: subscriberId } });
  if (!subscriber || !subscriber.consentAt || subscriber.status === "UNSUBSCRIBED") return { skipped: true };

  const result = await runAutomation({
    eventLogId: data.eventLogId as string | undefined,
    eventType: "newsletter.subscriber.created.v1",
    functionName: "newsletter-subscriber-created",
    idempotencyKey: buildIdempotencyKey(["run", "newsletter-subscriber-created", subscriber.id]),
    task: async (tx) => {
      await tx.newsletterEvent.create({
        data: {
          metadata: { automation: "double_opt_in" },
          subscriberId: subscriber.id,
          type: "CONFIRMATION_SENT",
        },
      });
      return { subscriberId: subscriber.id };
    },
  });

  if (!result.skipped) {
    await sendEmail({
      entityId: subscriber.id,
      entityType: "NewsletterSubscriber",
      recipient: subscriber.email,
      template: "newsletter.double_opt_in",
      templateInput: {
        confirmationUrl: `${siteUrl()}/newsletter/unsubscribe/${subscriber.unsubscribeToken}`,
      },
    });
  }

  return result;
}

export async function handleBlogPostPublished(data: EventData) {
  const postId = String(data.blogPostId ?? data.entityId ?? "");
  const post = await getPrisma().blogPost.findUnique({ where: { id: postId } });
  if (!post) return { skipped: true };

  return runAutomation({
    eventLogId: data.eventLogId as string | undefined,
    eventType: "blog.post.published.v1",
    functionName: "blog-post-published",
    idempotencyKey: buildIdempotencyKey(["run", "blog-published", post.id]),
    task: async (tx) => {
      await tx.marketingEvent.create({
        data: {
          metadata: { automation: "blog_published", slug: post.slug },
          postId: post.id,
          source: "cms",
          type: "ARTICLE_VIEW",
        },
      });
      await createInternalNotification({
        body: `Opublikowano wpis: ${post.title}. Newsletter wymaga osobnej decyzji, automatyzacja nie wysyla kampanii.`,
        entityId: post.id,
        entityType: "BlogPost",
        title: "Wpis bloga opublikowany",
        tx,
        type: "blog.post.published",
      });
      return { blogPostId: post.id };
    },
  });
}

export async function handleOperationsReport(data: EventData, eventType: WorkflowEventType) {
  const prisma = getPrisma();
  const [leads, orders, failedPayments, failedJobs, reviewDocuments, overdueTasks] = await Promise.all([
    prisma.crmLead.count({ where: { createdAt: { gte: startOfDay(new Date()) } } }),
    prisma.order.count({ where: { createdAt: { gte: startOfDay(new Date()) } } }),
    prisma.payment.count({ where: { status: "FAILED" } }),
    prisma.documentGenerationJob.count({ where: { status: "FAILED" } }),
    prisma.generatedDocument.count({ where: { status: "GENERATED" } }),
    prisma.crmTask.count({ where: { dueAt: { lt: new Date() }, status: { notIn: ["DONE", "CANCELLED"] } } }),
  ]);

  return runAutomation({
    eventLogId: data.eventLogId as string | undefined,
    eventType,
    functionName: "operations-report",
    idempotencyKey: buildIdempotencyKey(["run", eventType, new Date().toISOString().slice(0, 10)]),
    task: async (tx) => {
      await createInternalNotification({
        body: `Leady: ${leads}, zamowienia: ${orders}, platnosci failed: ${failedPayments}, dokumenty failed: ${failedJobs}, review: ${reviewDocuments}, zadania overdue: ${overdueTasks}.`,
        title: eventType.includes("weekly") ? "Tygodniowy raport operacyjny" : "Dzienny raport CRM",
        tx,
        type: eventType,
      });
      return { failedJobs, failedPayments, leads, orders, overdueTasks, reviewDocuments };
    },
  });
}

async function ensureTask(tx: Prisma.TransactionClient, input: {
  description: string;
  entityId: string;
  entityType: string;
  organizationId?: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  title: string;
}) {
  const existing = await tx.crmTask.findFirst({
    where: {
      entityId: input.entityId,
      entityType: input.entityType,
      organizationId: input.organizationId ?? null,
      title: input.title,
    },
  });
  if (existing) return existing;
  return tx.crmTask.create({ data: input });
}

function orderStatusUrl(orderNumber: string, token: string) {
  return `${siteUrl()}/zamowienie/${orderNumber}?token=${encodeURIComponent(token)}`;
}

function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

function startOfDay(date: Date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}
