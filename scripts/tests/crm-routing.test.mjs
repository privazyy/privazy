import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");

test("canonical CRM and legacy redirect routes are present", () => {
  assert.match(read("src/app/crm/[[...segments]]/page.tsx"), /callbackUrl=\/crm/);
  assert.match(read("src/app/admin/[[...segments]]/page.tsx"), /permanentRedirect\(`\/crm/);
  assert.match(read("src/proxy.ts"), /matcher: \["\/admin\/:path\*", "\/crm\/:path\*"\]/);
});

test("application links and responsive smoke use /crm", () => {
  for (const path of ["src/app/dashboard/page.tsx", "src/components/blog/blog-chrome.tsx", "scripts/check-responsive.mjs"]) {
    const source = read(path);
    assert.match(source, /\/crm/);
    assert.doesNotMatch(source, /href=.*\/admin/);
  }
});

test("login form uses the Auth.js v5 redirect option and never defaults to GET", () => {
  const source = read("src/components/auth/login-form.tsx");
  assert.match(source, /redirectTo: callbackUrl/);
  assert.match(source, /method="post"/);
  assert.doesNotMatch(source, /callbackUrl,\s*\n\s*email:/);
});
