# Document Input Gap Closure Update - 2026-07-09

Closed or reduced:
- Added minimal paid `OrderItem -> DocumentInput` data path.
- Added client draft and submit API.
- Added privacy-policy input schema and protected UI.
- Added CRM document input visibility and staff correction/lock endpoints.
- Added audit logging without full `dataJson`.

Still open:
- Rehearse migration on disposable/staging database.
- Harden or retire legacy public `/api/documents/generate`.
- Add production-ready privacy-policy DOCX generator.
- Add full checkout/payment event integration.
- Add automated security tests for cross-tenant cases.

Next recommended PR: `[documents] add production-ready privacy policy generator`.

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
