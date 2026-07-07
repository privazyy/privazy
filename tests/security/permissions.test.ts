import { describe, expect, it } from "vitest";

import {
  canAccessClientPortal,
  canAccessCrm,
  canManageSettings,
  canManageUsers,
  canMutateCrm,
  canReadCrm,
  canReviewDocuments,
  canRetryDocumentJob,
} from "@/server/auth/permissions";
import { testUsers, unauthenticated } from "../helpers/users";

describe("CRM and role permissions", () => {
  it("allows staff roles to access CRM and blocks clients/anonymous users", () => {
    expect(canAccessCrm(testUsers.ADMIN)).toBe(true);
    expect(canAccessCrm(testUsers.LAWYER)).toBe(true);
    expect(canAccessCrm(testUsers.OPERATOR)).toBe(true);
    expect(canAccessCrm(testUsers.READ_ONLY)).toBe(true);
    expect(canReadCrm(testUsers.READ_ONLY)).toBe(true);
    expect(canAccessCrm(testUsers.CLIENT)).toBe(false);
    expect(canAccessCrm(unauthenticated)).toBe(false);
  });

  it("keeps READ_ONLY and CLIENT out of CRM mutations", () => {
    expect(canMutateCrm(testUsers.ADMIN)).toBe(true);
    expect(canMutateCrm(testUsers.LAWYER)).toBe(true);
    expect(canMutateCrm(testUsers.OPERATOR)).toBe(true);
    expect(canMutateCrm(testUsers.READ_ONLY)).toBe(false);
    expect(canMutateCrm(testUsers.CLIENT)).toBe(false);
  });

  it("keeps admin-only permissions admin-only", () => {
    expect(canManageUsers(testUsers.ADMIN)).toBe(true);
    expect(canManageSettings(testUsers.ADMIN)).toBe(true);
    expect(canManageUsers(testUsers.OPERATOR)).toBe(false);
    expect(canManageSettings(testUsers.LAWYER)).toBe(false);
  });

  it("allows document review and retry only for mutating staff roles", () => {
    expect(canReviewDocuments(testUsers.ADMIN)).toBe(true);
    expect(canRetryDocumentJob(testUsers.LAWYER)).toBe(true);
    expect(canReviewDocuments(testUsers.OPERATOR)).toBe(true);
    expect(canReviewDocuments(testUsers.READ_ONLY)).toBe(false);
    expect(canReviewDocuments(testUsers.CLIENT)).toBe(false);
  });

  it("keeps client portal access scoped to CLIENT users", () => {
    expect(canAccessClientPortal(testUsers.CLIENT)).toBe(true);
    expect(canAccessClientPortal(testUsers.ADMIN)).toBe(false);
    expect(canAccessClientPortal(unauthenticated)).toBe(false);
  });
});
