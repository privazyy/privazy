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
