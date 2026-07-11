import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");

test("CRM UI blocks CLIENT and requires a session", () => {
  const page = read("src/app/crm/[[...segments]]/page.tsx");
  assert.match(page, /!session\?\.user\?\.id/);
  assert.match(page, /role === "CLIENT"/);
});

test("CRM API access helpers enforce the role matrix", () => {
  const access = read("src/server/crm/access.ts");
  assert.match(access, /CRM_READ_ROLES/);
  assert.match(access, /CRM_WRITE_ROLES/);
  assert.match(access, /CRM_READ_ROLES = new Set<UserRole>\(\["ADMIN", "LAWYER", "OPERATOR", "READ_ONLY"\]\)/);
  assert.doesNotMatch(access, /CRM_READ_ROLES[^\n]+CLIENT/);
});

test("safe CRM errors do not serialize stacks", () => {
  const errors = read("src/server/crm/errors.ts");
  assert.doesNotMatch(errors, /error\.stack|stack:/);
  assert.match(errors, /toSafeCrmError/);
});
