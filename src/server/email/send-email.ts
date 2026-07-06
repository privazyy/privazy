import "server-only";

import { Resend } from "resend";

import { emailIdempotencyKey } from "@/server/automations/idempotency";
import { createQueuedEmailLog, markEmailLogFailed, markEmailLogSent, markEmailLogSkipped } from "@/server/email/email-log";
import { developmentMailer } from "@/server/email/development-mailer";
import { renderEmailTemplate, type EmailTemplateName } from "@/server/email/templates/transactional";

let resend: Resend | null = null;

function getResend() {
  if (resend) return resend;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  resend = new Resend(apiKey);
  return resend;
}

export async function sendEmail(input: {
  entityId?: string | null;
  entityType?: string | null;
  idempotencyKey?: string;
  organizationId?: string | null;
  recipient: string;
  template: EmailTemplateName;
  templateInput?: Record<string, string | number | null | undefined>;
}) {
  const rendered = renderEmailTemplate(input.template, input.templateInput ?? {});
  const idempotencyKey =
    input.idempotencyKey ??
    emailIdempotencyKey({
      recipient: input.recipient,
      resourceId: input.entityId ?? rendered.subject,
      template: input.template,
    });
  const log = await createQueuedEmailLog({
    entityId: input.entityId,
    entityType: input.entityType,
    idempotencyKey,
    organizationId: input.organizationId,
    recipient: input.recipient,
    subject: rendered.subject,
    template: input.template,
  });

  if (log.status === "SENT" || log.status === "SKIPPED") {
    return { emailLogId: log.id, skipped: true };
  }

  const from = process.env.RESEND_FROM;
  const client = getResend();

  try {
    if (!from || !client) {
      const result = await developmentMailer({
        html: rendered.html,
        recipient: input.recipient,
        subject: rendered.subject,
        template: input.template,
      });
      await markEmailLogSkipped(log.id, result.providerId);
      return { emailLogId: log.id, skipped: true };
    }

    const result = await client.emails.send({
      from,
      html: rendered.html,
      subject: rendered.subject,
      to: input.recipient,
    });
    await markEmailLogSent(log.id, result.data?.id ?? null);
    return { emailLogId: log.id, providerId: result.data?.id, skipped: false };
  } catch (error) {
    await markEmailLogFailed(log.id, error).catch(() => undefined);
    console.error("Transactional email failed", { error, template: input.template });
    return { emailLogId: log.id, error, skipped: false };
  }
}
