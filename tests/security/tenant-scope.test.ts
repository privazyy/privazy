import { describe, expect, it } from "vitest";

import {
  assertCanMutateOrganization,
  assertCanReadDocumentJob,
  assertCanReadGeneratedDocument,
  assertOrganizationAccess,
  canAccessOrganization,
  canReadOrganizationDocuments,
} from "@/server/auth/organization-access";
import { clientMemberships, organizationA, organizationB } from "../helpers/organizations";
import { testUsers } from "../helpers/users";

describe("organization and tenant isolation", () => {
  it("allows CLIENT users only for their own organization", () => {
    expect(canAccessOrganization(testUsers.CLIENT, organizationA, clientMemberships)).toBe(true);
    expect(canReadOrganizationDocuments(testUsers.CLIENT, organizationA, clientMemberships)).toBe(true);
    expect(canAccessOrganization(testUsers.CLIENT, organizationB, clientMemberships)).toBe(false);
    expect(() => assertOrganizationAccess(testUsers.CLIENT, organizationB, clientMemberships)).toThrow(/Organization access denied/);
  });

  it("denies unauthenticated access and missing memberships", () => {
    expect(canAccessOrganization(null, organizationA, clientMemberships)).toBe(false);
    expect(canAccessOrganization(testUsers.CLIENT, "unknown_org", [])).toBe(false);
  });

  it("allows staff reads while keeping READ_ONLY out of mutations", () => {
    expect(canAccessOrganization(testUsers.ADMIN, organizationB, [])).toBe(true);
    expect(canAccessOrganization(testUsers.READ_ONLY, organizationB, [])).toBe(true);
    expect(() => assertCanMutateOrganization(testUsers.READ_ONLY, organizationB, [])).toThrow(/Organization mutation denied/);
    expect(assertCanMutateOrganization(testUsers.OPERATOR, organizationB, [])).toBe(true);
  });

  it("uses the same organization helper for document job and generated document reads", () => {
    expect(assertCanReadDocumentJob(testUsers.CLIENT, { organizationId: organizationA }, clientMemberships)).toBe(true);
    expect(assertCanReadGeneratedDocument(testUsers.CLIENT, { organizationId: organizationA }, clientMemberships)).toBe(true);
    expect(() => assertCanReadDocumentJob(testUsers.CLIENT, { organizationId: organizationB }, clientMemberships)).toThrow();
  });
});
