import "server-only";
import { Resend } from "resend";

let resend: Resend | null = null;

function getResend() {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      throw new Error("Missing environment variable: RESEND_API_KEY");
    }

    resend = new Resend(apiKey);
  }

  return resend;
}

export async function sendDocumentsReadyEmail(input: {
  to: string;
  organizationName: string;
  downloadUrl: string;
}) {
  const from = process.env.RESEND_FROM;

  if (!from) {
    throw new Error("Missing environment variable: RESEND_FROM");
  }

  return getResend().emails.send({
    from,
    to: input.to,
    subject: "Dokumenty PRIVAZY są gotowe",
    html: `
      <p>Dzień dobry,</p>
      <p>Dokumenty dla organizacji <strong>${input.organizationName}</strong> są gotowe do pobrania.</p>
      <p><a href="${input.downloadUrl}">Pobierz dokument</a></p>
    `,
  });
}

export async function logDocumentNotification(input: {
  event: "document.input_required" | "document.generating" | "document.ready" | "document.failed" | "document.review_required";
  organizationId: string;
  orderItemId?: string;
  generatedDocumentId?: string;
  userId?: string;
}) {
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM) {
    console.info("[documents:mail-log]", {
      event: input.event,
      organizationId: input.organizationId,
      orderItemId: input.orderItemId,
      generatedDocumentId: input.generatedDocumentId,
      userId: input.userId,
    });

    return { delivered: false, mode: "development-log" as const };
  }

  return { delivered: false, mode: "resend-not-wired-for-phase-6r" as const };
}
