import { describe, expect, it } from "vitest";

import { assertCanGenerateDocument, resolveDocumentGenerationContext } from "@/server/documents/security";
import { sessionFor } from "../helpers/users";

const payload = {
  createdById: "user_client",
  data: { company: "Example sp. z o.o." },
  organizationId: "org_a",
  templateId: "template_active",
};

describe("document generation gate", () => {
  it("denies unauthenticated users, CLIENT, and READ_ONLY before job creation", () => {
    expect(() => assertCanGenerateDocument(null)).toThrow(/Authentication required/);
    expect(() => resolveDocumentGenerationContext(sessionFor("CLIENT"), payload)).toThrow(/Document generation denied/);
    expect(() => resolveDocumentGenerationContext(sessionFor("READ_ONLY"), payload)).toThrow(/Document generation denied/);
  });

  it("allows staff document generation and derives createdById from the session", () => {
    const context = resolveDocumentGenerationContext(sessionFor("OPERATOR"), {
      ...payload,
      createdById: "attacker_supplied_user",
      organizationId: "org_b",
      templateId: "template_supplied",
    });

    expect(context.actor.role).toBe("OPERATOR");
    expect(context.input.createdById).toBe("user_operator");
    expect(context.input.organizationId).toBe("org_b");
    expect(context.input.templateId).toBe("template_supplied");
  });

  it("maps invalid payloads to validation failures", () => {
    expect(() => resolveDocumentGenerationContext(sessionFor("ADMIN"), { data: {} })).toThrow();
  });
});
