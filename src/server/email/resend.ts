import "server-only";

import { sendEmail } from "@/server/email/send-email";

export async function sendDocumentsReadyEmail(input: {
  generatedDocumentId?: string;
  organizationId?: string;
  organizationName: string;
  to: string;
}) {
  return sendEmail({
    entityId: input.generatedDocumentId,
    entityType: "GeneratedDocument",
    organizationId: input.organizationId,
    recipient: input.to,
    template: "document.ready",
    templateInput: {
      organizationName: input.organizationName,
    },
  });
}
