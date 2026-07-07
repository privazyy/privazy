import { describe, expect, it } from "vitest";

import { crmLeadsQuerySchema, requireCrmApiMutation, requireCrmApiRead, serializeCrmLead } from "@/server/crm/security";
import { sessionFor } from "../helpers/users";

describe("CRM API security", () => {
  it("denies unauthenticated and CLIENT reads", () => {
    expect(() => requireCrmApiRead(null)).toThrow(/Authentication required/);
    expect(() => requireCrmApiRead(sessionFor("CLIENT"))).toThrow(/CRM access denied/);
  });

  it("allows CRM reads for staff roles including READ_ONLY", () => {
    expect(requireCrmApiRead(sessionFor("READ_ONLY")).role).toBe("READ_ONLY");
    expect(requireCrmApiRead(sessionFor("OPERATOR")).role).toBe("OPERATOR");
    expect(requireCrmApiRead(sessionFor("LAWYER")).role).toBe("LAWYER");
    expect(requireCrmApiRead(sessionFor("ADMIN")).role).toBe("ADMIN");
  });

  it("blocks READ_ONLY and CLIENT mutations", () => {
    expect(() => requireCrmApiMutation(sessionFor("READ_ONLY"))).toThrow(/CRM mutation denied/);
    expect(() => requireCrmApiMutation(sessionFor("CLIENT"))).toThrow(/CRM access denied/);
    expect(requireCrmApiMutation(sessionFor("OPERATOR")).role).toBe("OPERATOR");
  });

  it("rejects or normalizes invalid lead query limits without requiring a database", () => {
    expect(crmLeadsQuerySchema.parse({ limit: "25" }).limit).toBe(25);
    expect(crmLeadsQuerySchema.parse({ limit: "250" }).limit).toBe(50);
    expect(crmLeadsQuerySchema.parse({ limit: "abc" }).limit).toBe(50);
  });

  it("serializes CRM leads without raw storage keys or internal metadata", () => {
    const result = serializeCrmLead({
      company: "Example sp. z o.o.",
      fileKey: "private/raw-key",
      hot: true,
      id: "lead_1",
      industry: "IT",
      internalMetadata: { secret: true },
      lastActivity: "dzisiaj",
      owner: "AK",
      resultLabel: "IOD wymagany",
      source: "Landing",
      stage: "Nowy",
      value: 8900,
    });

    expect(result).not.toHaveProperty("fileKey");
    expect(result).not.toHaveProperty("internalMetadata");
  });
});
