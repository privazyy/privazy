# Audit Gap Closure Plan

Completed in this PR:

1. Dedicated Lead and related CRM schema.
2. Staff/role authorization on `/admin` and `/api/crm/*`.
3. Validated, bounded lead and organization APIs.
4. Safe conversion, internal notes, assignees and transactional audit.
5. Public IOD intake connected directly to Lead.

Next recommended PR: `[crm] add tasks notes and activity timeline`.

Later phases should cover remaining CRM modules, task CRUD and activity timeline, controlled deduplication review UI, staging migration rehearsal, security smoke automation, portal isolation, breach/DSR workflows and production readiness gates.

The public IOD route still needs durable abuse protection (for example Turnstile plus a shared limiter) in a dedicated security change; this PR does not claim that gap is closed.

## Release candidate gap closure plan - 2026-07-10

Required before another staging RC attempt:

1. Protect `/api/documents/generate` with auth, paid-order gating, server-derived org/user scope, and safe retries.
2. Add a permission-checked secure download route and download audit.
3. Implement or merge client portal routes and prove cross-org isolation.
4. Implement or merge commerce/order/payment/invoice foundations or explicitly remove them from staging scope.
5. Implement or merge breach, DSR, notification, CMS and newsletter foundations or explicitly mark them out of staging scope.
6. Add `test`, `test:security`, `test:smoke`, `env:check`, and `env:check:staging` scripts.
7. Apply migrations to a disposable/staging database and record migration status.
8. Verify Supabase RLS/Data API grants manually in the dashboard.
9. Complete legal docs, cookie/sales/refund terms, consent copy and approval metadata.
10. Run `docs/STAGING_SMOKE_TEST_PLAN.md` end to end.

Recommended next PR: `[launch] prepare controlled soft launch runbook`, but only after this `STAGING_NO_GO` is either accepted as a blocker report or the critical gaps are closed in dedicated implementation PRs.
