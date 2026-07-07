import { describe, expect, it } from "vitest";

import { documentQueryInputSchema } from "@/server/documents/security";
import { serializeDocumentJobForClient, serializeGeneratedDocumentForClient } from "@/server/documents/serializers";

describe("document query serializers", () => {
  it("does not expose raw file keys in client job serializers", () => {
    const serialized = serializeDocumentJobForClient({
      errorMessage: "postgresql://user:pass@example.supabase.co/db failed with stack trace",
      generatedDocument: {
        docxFileKey: "private/docx",
        generationJobId: "job_1",
        id: "document_1",
        organizationId: "org_a",
        pdfFileKey: "private/pdf",
        status: "GENERATED",
        templateId: "template_1",
        templateVersion: 1,
        type: "PRIVACY_POLICY",
        zipFileKey: "private/zip",
      },
      id: "job_1",
      organizationId: "org_a",
      status: "FAILED",
      template: {
        fileKey: "templates/private.docx",
        id: "template_1",
        name: "Privacy Policy",
        type: "PRIVACY_POLICY",
        version: 1,
      },
      templateId: "template_1",
    });

    expect(JSON.stringify(serialized)).not.toContain("fileKey");
    expect(JSON.stringify(serialized)).not.toContain("postgresql://");
    expect(JSON.stringify(serialized)).not.toContain("stack trace");
  });

  it("does not expose raw file keys in generated document serializers", () => {
    const serialized = serializeGeneratedDocumentForClient({
      docxFileKey: "private/docx",
      generationJobId: "job_1",
      id: "document_1",
      organizationId: "org_a",
      pdfFileKey: "private/pdf",
      status: "GENERATED",
      templateId: "template_1",
      templateVersion: 1,
      type: "PRIVACY_POLICY",
      zipFileKey: "private/zip",
    });

    expect(serialized).not.toHaveProperty("docxFileKey");
    expect(serialized).not.toHaveProperty("pdfFileKey");
    expect(serialized).not.toHaveProperty("zipFileKey");
  });

  it("caps pagination and rejects invalid status filters", () => {
    expect(documentQueryInputSchema.parse({ limit: "250" }).limit).toBe(50);
    expect(() => documentQueryInputSchema.parse({ status: "DELETED" })).toThrow();
  });
});
