import { describe, expect, it } from "vitest";

import { assertCanTransitionCms, canEditCmsDraft, canPublishCms, canReadCms } from "@/server/cms/permissions";
import type { CrmActor } from "@/server/crm/permissions";

function actor(role: CrmActor["role"]): CrmActor {
  return { email: `${role.toLowerCase()}@privazy.test`, id: role, name: role, role };
}

describe("CMS permissions", () => {
  it("allows internal read but blocks CLIENT", () => {
    expect(canReadCms(actor("ADMIN"))).toBe(true);
    expect(canReadCms(actor("READ_ONLY"))).toBe(true);
    expect(canReadCms(actor("CLIENT"))).toBe(false);
  });

  it("separates draft edit from publish/review powers", () => {
    expect(canEditCmsDraft(actor("OPERATOR"))).toBe(true);
    expect(canPublishCms(actor("OPERATOR"))).toBe(false);
    expect(canPublishCms(actor("LAWYER"))).toBe(true);
    expect(() => assertCanTransitionCms(actor("OPERATOR"), "PUBLISHED")).toThrow(/Publikacja/);
    expect(() => assertCanTransitionCms(actor("READ_ONLY"), "IN_REVIEW")).toThrow(/nie moze/);
    expect(() => assertCanTransitionCms(actor("LAWYER"), "SCHEDULED")).not.toThrow();
  });
});
