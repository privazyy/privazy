import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");

test("active CRM navigation exposes only database-backed operational modules", () => {
  const navigation = read("src/components/crm/crm-data.ts");
  for (const route of ["leads", "clients", "tasks", "orders", "payments", "invoices", "document-inputs", "document-jobs", "documents", "breaches", "requests", "admin"]) {
    assert.match(navigation, new RegExp(`route: "${route}"`));
  }
  for (const route of ["blog", "newsletter", "outsourcing", "automations", "inbox", "calendar"]) {
    assert.doesNotMatch(navigation.match(/export const navGroups[\s\S]*?export const routeAliases/)?.[0] ?? "", new RegExp(`route: "${route}"`));
  }
});

test("breach permissions separate portal, triage, risk, and read-only roles", () => {
  const permissions = read("src/server/breach/breach-permissions.ts");
  assert.match(permissions, /STAFF_READ_ROLES[^\n]+"READ_ONLY"/);
  assert.match(permissions, /TRIAGE_ROLES[^\n]+"OPERATOR"/);
  assert.match(permissions, /RISK_ROLES[^\n]+"ADMIN", "LAWYER"/);
  assert.match(permissions, /CROSS_TENANT_BLOCKED/);
  assert.match(permissions, /role === "READ_ONLY"/);
});

test("DSR response preparation is limited and portal access is organization-scoped", () => {
  const access = read("src/server/dsr/access.ts");
  assert.match(access, /RESPONSE_ROLES[^\n]+"ADMIN", "LAWYER"/);
  assert.match(access, /role !== "CLIENT"/);
  assert.match(access, /clientProfile\.findFirst/);
  assert.match(access, /organizationId: profile\.organizationId/);
});

test("document input workflow blocks cross-tenant and unpaid client access", () => {
  const permissions = read("src/server/documents/input-permissions.ts");
  assert.match(permissions, /CROSS_TENANT_BLOCKED/);
  assert.match(permissions, /paymentStatus !== "PAID"/);
  assert.match(permissions, /\["DRAFT", "NEEDS_CORRECTION"\]/);
  assert.match(permissions, /STAFF_READ_ROLES[^\n]+"READ_ONLY"/);
});

test("private operational tables enable RLS and revoke Supabase Data API grants", () => {
  for (const migration of [
    "prisma/migrations/20260709182000_add_crm_commerce_document_operations/migration.sql",
    "prisma/migrations/20260709195000_add_client_document_input_flow/migration.sql",
    "prisma/migrations/20260710093000_add_breach_incident_module/migration.sql",
    "prisma/migrations/20260710103000_add_dsr_module/migration.sql",
  ]) {
    const sql = read(migration);
    assert.match(sql, /ENABLE ROW LEVEL SECURITY/);
    assert.match(sql, /REVOKE ALL ON TABLE/);
  }
});
