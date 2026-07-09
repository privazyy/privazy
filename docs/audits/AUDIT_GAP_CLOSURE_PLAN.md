# Client Portal Gap Closure Update - 2026-07-09

Closed or reduced:
- Added protected `/platforma` foundation.
- Added portal-specific service/permission/serializer/API layers.
- Added scoped order, document input, generated document, organization views.
- Added secure generated-document download endpoint.
- Added portal docs and smoke checklist.

Still open:
- Rehearse new portal migration in disposable/staging database.
- Merge/reconcile earlier commerce and document-input draft PRs.
- Add production-ready privacy policy generator.
- Add seeded cross-tenant/API tests.
- Add breach incident module.

Next recommended PR: `[breach] add personal data breach incident module`.

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
