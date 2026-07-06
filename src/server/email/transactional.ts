import "server-only";

import { sendEmail } from "@/server/email/send-email";

export async function sendTransactionalEmail(input: {
  entityId?: string | null;
  entityType?: string | null;
  html: string;
  idempotencyKey?: string;
  organizationId?: string | null;
  subject: string;
  templateName?: "transactional.custom";
  to: string;
}) {
  return sendEmail({
    entityId: input.entityId,
    entityType: input.entityType,
    idempotencyKey: input.idempotencyKey,
    organizationId: input.organizationId,
    recipient: input.to,
    template: input.templateName ?? "transactional.custom",
    templateInput: {
      html: input.html,
      subject: input.subject,
    },
  });
}

export function orderConfirmationEmail(input: { orderNumber: string; statusUrl: string }) {
  return {
    subject: `PRIVAZY: zamowienie ${input.orderNumber} zostalo przyjete`,
    html: `
      <p>Dzien dobry,</p>
      <p>Przyjelismy zamowienie <strong>${input.orderNumber}</strong>.</p>
      <p>Status zamowienia: <a href="${input.statusUrl}">${input.statusUrl}</a></p>
    `,
  };
}

export function paymentConfirmedEmail(input: { orderNumber: string; statusUrl: string }) {
  return {
    subject: `PRIVAZY: platnosc za ${input.orderNumber} zostala potwierdzona`,
    html: `
      <p>Dzien dobry,</p>
      <p>Platnosc za zamowienie <strong>${input.orderNumber}</strong> zostala potwierdzona.</p>
      <p>Kolejny krok to uzupelnienie formularza danych do dokumentu. Link znajduje sie w statusie zamowienia:</p>
      <p><a href="${input.statusUrl}">${input.statusUrl}</a></p>
    `,
  };
}

export function paymentFailedEmail(input: { orderNumber: string; statusUrl: string }) {
  return {
    subject: `PRIVAZY: platnosc za ${input.orderNumber} nie powiodla sie`,
    html: `
      <p>Dzien dobry,</p>
      <p>Platnosc za zamowienie <strong>${input.orderNumber}</strong> nie zostala potwierdzona.</p>
      <p>Mozesz sprawdzic status i ponowic platnosc tutaj: <a href="${input.statusUrl}">${input.statusUrl}</a></p>
    `,
  };
}

export function invoiceIssuedEmail(input: { invoiceNumber: string; orderNumber: string; statusUrl: string }) {
  return {
    subject: `PRIVAZY: faktura ${input.invoiceNumber} do zamowienia ${input.orderNumber}`,
    html: `
      <p>Dzien dobry,</p>
      <p>Wystawilismy fakture <strong>${input.invoiceNumber}</strong> do zamowienia <strong>${input.orderNumber}</strong>.</p>
      <p>Szczegoly zamowienia i faktury sa dostepne tutaj: <a href="${input.statusUrl}">${input.statusUrl}</a></p>
    `,
  };
}
