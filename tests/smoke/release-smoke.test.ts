import { describe, expect, it } from "vitest";

import { safeHttpError } from "@/server/api/errors";
import { classifyRoute } from "@/server/auth/route-policy";
import { requireCrmApiRead } from "@/server/crm/security";
import { assertCanGenerateDocument } from "@/server/documents/security";
import { serializeGeneratedDocumentForClient } from "@/server/documents/serializers";
import { getEnvValidationStatus } from "@/server/env";
import { sessionFor, testUsers } from "../helpers/users";

describe("release smoke tests", () => {
  it("keeps critical route groups classified", () => {
    expect(classifyRoute("/api/leads/iod")).toBe("public");
    expect(classifyRoute("/api/crm/leads")).toBe("staff");
    expect(classifyRoute("/admin")).toBe("staff");
    expect(classifyRoute("/documents")).toBe("authenticated");
  });

  it("keeps critical security helpers importable and active", () => {
    expect(requireCrmApiRead(sessionFor("ADMIN")).role).toBe("ADMIN");
    expect(assertCanGenerateDocument(testUsers.LAWYER).role).toBe("LAWYER");
    expect(safeHttpError("forbidden", "No").code).toBe("forbidden");
  });

  it("keeps env schema and serializers safe for CI smoke", () => {
    expect(getEnvValidationStatus({ NODE_ENV: "production" }).ok).toBe(false);
    const serialized = serializeGeneratedDocumentForClient({
      docxFileKey: "private/docx",
      generationJobId: "job_1",
      id: "doc_1",
      organizationId: "org_a",
      status: "GENERATED",
      templateId: "template_1",
      templateVersion: 1,
      type: "PRIVACY_POLICY",
    });
    expect(JSON.stringify(serialized)).not.toContain("fileKey");
  });
});
