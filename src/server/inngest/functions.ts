import { inngest } from "@/server/inngest/client";
import { buildIdempotencyKey } from "@/server/automations/idempotency";
import {
  emitDeadlineEvents,
  handleBlogPostPublished,
  handleDocumentFailed,
  handleDocumentSucceeded,
  handleInvoiceIssueRequested,
  handleNewsletterSubscriberCreated,
  handleOperationsReport,
  handleOrderCreated,
  handlePaymentFailed,
  handlePaymentSucceeded,
  handleReminder,
} from "@/server/automations/workflows";
import { runAutomation } from "@/server/automations/run";
import { generateDocumentFromJob } from "@/server/documents/service";
import { emitEvent } from "@/server/events/emit-event";

export const orderCreated = inngest.createFunction(
  { id: "order-created", name: "Order created follow-up", retries: 2 },
  { event: "order.created.v1" },
  async ({ event }) => handleOrderCreated(event.data),
);

export const paymentSucceeded = inngest.createFunction(
  { id: "payment-succeeded-follow-up", name: "Payment succeeded follow-up", retries: 2 },
  { event: "order.payment.succeeded.v1" },
  async ({ event }) => handlePaymentSucceeded(event.data),
);

export const paymentFailed = inngest.createFunction(
  { id: "payment-failed-follow-up", name: "Payment failed follow-up", retries: 2 },
  { event: "order.payment.failed.v1" },
  async ({ event }) => handlePaymentFailed(event.data),
);

export const invoiceIssueRequested = inngest.createFunction(
  { id: "invoice-issue-requested", name: "Invoice issue requested", retries: 2 },
  { event: "invoice.issue.requested.v1" },
  async ({ event }) => handleInvoiceIssueRequested(event.data),
);

export const generateDocument = inngest.createFunction(
  { id: "generate-document", name: "Generate document", retries: 3 },
  { event: "document.generate.requested.v1" },
  async ({ event, step }) => {
    const jobId = String(event.data.jobId ?? "");
    const eventLogId = typeof event.data.eventLogId === "string" ? event.data.eventLogId : undefined;
    const organizationId = typeof event.data.organizationId === "string" ? event.data.organizationId : undefined;

    const result = await runAutomation({
      eventLogId,
      eventType: "document.generate.requested.v1",
      functionName: "generate-document",
      idempotencyKey: buildIdempotencyKey(["run", "document-generate", jobId]),
      organizationId,
      task: async () =>
        step.run("render-docx-and-update-records", async () => {
          const document = await generateDocumentFromJob(jobId);
          return { generatedDocumentId: document.id, status: document.status };
        }),
    });

    if ("output" in result && result.output && typeof result.output === "object" && "generatedDocumentId" in result.output) {
      await emitEvent({
        eventType: "document.generate.succeeded.v1",
        idempotencyKey: buildIdempotencyKey(["document-succeeded", String(result.output.generatedDocumentId)]),
        organizationId,
        payload: {
          generatedDocumentId: String(result.output.generatedDocumentId),
          jobId,
          organizationId,
        },
        source: "generate-document",
      });
    } else if ("error" in result) {
      await emitEvent({
        eventType: "document.generate.failed.v1",
        idempotencyKey: buildIdempotencyKey(["document-failed", jobId]),
        organizationId,
        payload: { jobId, organizationId },
        source: "generate-document",
      });
    }

    return result;
  },
);

export const documentSucceeded = inngest.createFunction(
  { id: "document-succeeded-follow-up", name: "Document succeeded follow-up", retries: 2 },
  { event: "document.generate.succeeded.v1" },
  async ({ event }) => handleDocumentSucceeded(event.data),
);

export const documentFailed = inngest.createFunction(
  { id: "document-failed-follow-up", name: "Document failed follow-up", retries: 2 },
  { event: "document.generate.failed.v1" },
  async ({ event }) => handleDocumentFailed(event.data),
);

export const deadlineScanner = inngest.createFunction(
  { id: "deadline-scanner", name: "Deadline scanner", retries: 1 },
  { cron: "0 * * * *" },
  async () => {
    await emitDeadlineEvents();
    return { ok: true };
  },
);

const reminderEvents = [
  "breach.deadline.24h.v1",
  "breach.deadline.6h.v1",
  "breach.overdue.v1",
  "dsr.deadline.7d.v1",
  "dsr.deadline.2d.v1",
  "dsr.overdue.v1",
  "crm.task.due_soon.v1",
  "crm.task.overdue.v1",
] as const;

export const reminderFunctions = reminderEvents.map((eventName) =>
  inngest.createFunction(
    { id: `reminder-${eventName.replaceAll(".", "-")}`, name: `Reminder ${eventName}`, retries: 2 },
    { event: eventName },
    async ({ event }) => handleReminder(event.data, eventName),
  ),
);

export const newsletterSubscriberCreated = inngest.createFunction(
  { id: "newsletter-subscriber-created", name: "Newsletter subscriber created", retries: 2 },
  { event: "newsletter.subscriber.created.v1" },
  async ({ event }) => handleNewsletterSubscriberCreated(event.data),
);

export const blogPostPublished = inngest.createFunction(
  { id: "blog-post-published", name: "Blog post published", retries: 2 },
  { event: "blog.post.published.v1" },
  async ({ event }) => handleBlogPostPublished(event.data),
);

export const dailyCrmReport = inngest.createFunction(
  { id: "daily-crm-report", name: "Daily CRM report", retries: 1 },
  { cron: "0 7 * * 1-5" },
  async () => {
    await emitEvent({
      eventType: "report.daily_crm.requested.v1",
      idempotencyKey: buildIdempotencyKey(["report", "daily-crm", new Date().toISOString().slice(0, 10)]),
      payload: { resourceId: new Date().toISOString().slice(0, 10) },
      source: "report-schedule",
    });
    return { ok: true };
  },
);

export const weeklyOperationsReport = inngest.createFunction(
  { id: "weekly-operations-report", name: "Weekly operations report", retries: 1 },
  { cron: "0 8 * * 1" },
  async () => {
    await emitEvent({
      eventType: "report.weekly_operations.requested.v1",
      idempotencyKey: buildIdempotencyKey(["report", "weekly-operations", new Date().toISOString().slice(0, 10)]),
      payload: { resourceId: new Date().toISOString().slice(0, 10) },
      source: "report-schedule",
    });
    return { ok: true };
  },
);

export const operationsReports = [
  inngest.createFunction(
    { id: "daily-crm-report-requested", name: "Daily CRM report requested", retries: 1 },
    { event: "report.daily_crm.requested.v1" },
    async ({ event }) => handleOperationsReport(event.data, "report.daily_crm.requested.v1"),
  ),
  inngest.createFunction(
    { id: "weekly-operations-report-requested", name: "Weekly operations report requested", retries: 1 },
    { event: "report.weekly_operations.requested.v1" },
    async ({ event }) => handleOperationsReport(event.data, "report.weekly_operations.requested.v1"),
  ),
];

export const inngestFunctions = [
  orderCreated,
  paymentSucceeded,
  paymentFailed,
  invoiceIssueRequested,
  generateDocument,
  documentSucceeded,
  documentFailed,
  deadlineScanner,
  ...reminderFunctions,
  newsletterSubscriberCreated,
  blogPostPublished,
  dailyCrmReport,
  weeklyOperationsReport,
  ...operationsReports,
];
