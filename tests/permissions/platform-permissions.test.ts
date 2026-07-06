import { describe, expect, it, vi } from "vitest";

import { canAccessClientPortal, canManageOrganization, isInternalPlatformRole } from "@/server/platform/permissions";

vi.mock("@/server/auth", () => ({ auth: vi.fn() }));

describe("client portal permissions", () => {
  it("allows clients and internal CRM roles into portal shell", () => {
    expect(canAccessClientPortal({ role: "CLIENT" })).toBe(true);
    expect(canAccessClientPortal({ role: "ADMIN" })).toBe(true);
    expect(canAccessClientPortal({ role: "READ_ONLY" })).toBe(true);
  });

  it("keeps organization management scoped to owner/admin/internal roles", () => {
    expect(isInternalPlatformRole("LAWYER")).toBe(true);
    expect(isInternalPlatformRole("CLIENT")).toBe(false);
    expect(canManageOrganization("OWNER")).toBe(true);
    expect(canManageOrganization("ADMIN")).toBe(true);
    expect(canManageOrganization("MEMBER")).toBe(false);
    expect(canManageOrganization("INTERNAL")).toBe(true);
  });
});
