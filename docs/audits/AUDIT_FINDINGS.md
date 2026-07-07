# Audit Findings

Date: 2026-07-07

This file records the test-related delta from `[test] add security and release smoke tests`.

| Finding | Status after this PR | Notes |
| ------- | -------------------- | ----- |
| P0-001 `/admin` public | PARTIAL | Server-side page guard and route classification/proxy baseline added. Full auth E2E remains manual. |
| P0-002 `/api/crm/leads` public | PARTIAL | CRM API read guard and tests added. Route handler integration with mocked DB remains future work. |
| P0-003 `/api/documents/generate` public and trusts client IDs | PARTIAL | Document generation now requires staff actor and derives `createdById` from session. Full template/order policy remains future work. |
| P0-004 document queries not tenant scoped | PARTIAL | Organization access helper and document router scoping added. Full Prisma mock integration remains future work. |
| P0-005 no central guard for private routes | PARTIAL | Route classification helper and proxy baseline added. Server-side guards remain the source of truth. |
| P0-006 missing env causes private route 500 | PARTIAL | Env status helper and safe config error tests added. Full private route graceful fallback remains manual. |
| P1-004 no test scripts or test directories | PARTIAL | Vitest, scripts, fixtures, security tests, smoke tests, and CI integration added. Mark FIXED only after this branch is merged and CI is green. |

Do not mark staging or production ready from this PR alone.
