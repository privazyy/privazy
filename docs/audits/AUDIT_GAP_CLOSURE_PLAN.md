# Audit Gap Closure Plan

Completed in this PR:

1. Dedicated Lead and related CRM schema.
2. Staff/role authorization on `/crm` and `/api/crm/*`.
3. Validated, bounded lead and organization APIs.
4. Safe conversion, internal notes, assignees and transactional audit.
5. Public IOD intake connected directly to Lead.

Next recommended PR: `[crm] add tasks notes and activity timeline`.

Later phases should cover remaining CRM modules, task CRUD and activity timeline, controlled deduplication review UI, staging migration rehearsal, security smoke automation, portal isolation, breach/DSR workflows and production readiness gates.

The public IOD route still needs durable abuse protection (for example Turnstile plus a shared limiter) in a dedicated security change; this PR does not claim that gap is closed.

## Operational CRM update

Completed in this PR:

1. CRM baseline audit and operational master plan under `docs/crm`.
2. Shared CRM permission facade for future modules.
3. Task list/detail/create/update/status APIs.
4. Lead/organization task endpoints.
5. Lead/organization contact create endpoints.
6. Audit-backed CRM activity and timeline endpoints.
7. DB-backed task dashboard/list state.
8. Safe removal of raw template `fileKey` from CRM product table secondary text.

Still open:

1. Automated role-matrix tests.
2. Commerce models and safe CRM views for orders, payments and invoices.
3. Document operation APIs for input/retry/review/download history.
4. Breach and DSR models on this base branch.
5. Staff notifications.
6. Staging smoke and release audit.

Next recommended PR: `[crm] harden operational CRM with QA, performance and release smoke tests`.
