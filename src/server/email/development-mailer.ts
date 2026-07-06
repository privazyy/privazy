import "server-only";

export async function developmentMailer(input: {
  html: string;
  recipient: string;
  subject: string;
  template: string;
}) {
  console.info("Development mail log", {
    recipient: input.recipient,
    subject: input.subject,
    template: input.template,
  });

  return {
    providerId: `dev:${input.template}:${Date.now()}`,
    skipped: true,
  };
}
