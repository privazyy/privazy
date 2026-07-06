import { describe, expect, it, vi } from "vitest";

import type { CrmActor } from "@/server/crm/permissions";
import {
  assertCanMutateCrm,
  canAccessCrmRoute,
  canAccessFinancials,
  canHandleBreach,
  canManageSettings,
  canMutateCrm,
  canReadCrm,
  canRetryDocumentJob,
} from "@/server/crm/permissions";

vi.mock("@/server/auth", () => ({ auth: vi.fn() }));

function actor(role: CrmActor["role"]): CrmActor {
  return { email: `${role.toLowerCase()}@privazy.test`, id: role, name: role, role };
}

describe("CRM role permissions", () => {
  it("keeps CLIENT out of CRM and READ_ONLY read-only", () => {
    expect(canReadCrm({ role: "CLIENT" })).toBe(false);
    expect(canAccessCrmRoute("CLIENT", "dashboard")).toBe(false);
    expect(canReadCrm(actor("READ_ONLY"))).toBe(true);
    expect(canMutateCrm(actor("READ_ONLY"), "leads")).toBe(false);
    expect(() => assertCanMutateCrm(actor("READ_ONLY"), "leads")).toThrow(/READ_ONLY/);
  });

  it("limits mutations to role-specific scopes", () => {
    expect(canMutateCrm(actor("ADMIN"), "settings")).toBe(true);
    expect(canManageSettings(actor("ADMIN"))).toBe(true);
    expect(canMutateCrm(actor("LAWYER"), "documents")).toBe(true);
    expect(canMutateCrm(actor("LAWYER"), "orders")).toBe(false);
    expect(canMutateCrm(actor("OPERATOR"), "leads")).toBe(true);
    expect(canMutateCrm(actor("OPERATOR"), "breaches")).toBe(false);
  });

  it("covers sensitive CRM workflows", () => {
    expect(canHandleBreach(actor("LAWYER"))).toBe(true);
    expect(canHandleBreach(actor("OPERATOR"))).toBe(false);
    expect(canRetryDocumentJob(actor("OPERATOR"))).toBe(true);
    expect(canAccessFinancials(actor("READ_ONLY"))).toBe(true);
  });
});
