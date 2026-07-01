import "server-only";

import { Resend } from "resend";

let resend: Resend | null = null;

function getResend() {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return null;
    resend = new Resend(apiKey);
  }

  return resend;
}

export async function sendTransactionalEmail(input: {
  html: string;
  subject: string;
  to: string;
}) {
  const from = process.env.RESEND_FROM;
  const client = getResend();

  if (!from || !client) {
    if (process.env.NODE_ENV !== "production") {
      console.info("Transactional email skipped in development", {
        subject: input.subject,
        to: input.to,
      });
      return { skipped: true };
    }

    throw new Error("Missing Resend environment variables.");
  }

  return client.emails.send({
    from,
    html: input.html,
    subject: input.subject,
    to: input.to,
  });
}

export function orderConfirmationEmail(input: { orderNumber: string; statusUrl: string }) {
  return {
    subject: `PRIVAZY: zamówienie ${input.orderNumber} zostało przyjęte`,
    html: `
      <p>Dzień dobry,</p>
      <p>Przyjęliśmy zamówienie <strong>${input.orderNumber}</strong>.</p>
      <p>Status zamówienia: <a href="${input.statusUrl}">${input.statusUrl}</a></p>
    `,
  };
}

export function paymentConfirmedEmail(input: { orderNumber: string; statusUrl: string }) {
  return {
    subject: `PRIVAZY: płatność za ${input.orderNumber} została potwierdzona`,
    html: `
      <p>Dzień dobry,</p>
      <p>Płatność za zamówienie <strong>${input.orderNumber}</strong> została potwierdzona.</p>
      <p>Kolejny krok to uzupełnienie formularza danych do dokumentu. Link znajduje się w statusie zamówienia:</p>
      <p><a href="${input.statusUrl}">${input.statusUrl}</a></p>
    `,
  };
}

export function paymentFailedEmail(input: { orderNumber: string; statusUrl: string }) {
  return {
    subject: `PRIVAZY: płatność za ${input.orderNumber} nie powiodła się`,
    html: `
      <p>Dzień dobry,</p>
      <p>Płatność za zamówienie <strong>${input.orderNumber}</strong> nie została potwierdzona.</p>
      <p>Możesz sprawdzić status i ponowić płatność tutaj: <a href="${input.statusUrl}">${input.statusUrl}</a></p>
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
