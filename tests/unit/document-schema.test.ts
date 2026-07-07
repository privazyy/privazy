import { describe, expect, it } from "vitest";

import { documentGenerateApiSchema } from "@/server/documents/schemas";

describe("baseline public schemas", () => {
  it("keeps document generation payload validation available", () => {
    expect(
      documentGenerateApiSchema.safeParse({
        createdById: "user_1",
        data: {},
        organizationId: "org_1",
        templateId: "template_1",
      }).success,
    ).toBe(true);
  });

  it("rejects incomplete document generation payloads", () => {
    expect(documentGenerateApiSchema.safeParse({ data: {} }).success).toBe(false);
  });
});
