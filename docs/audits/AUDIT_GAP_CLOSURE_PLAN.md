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
2. Staff/role authorization on `/crm` and `/api/crm/*`.
3. Validated, bounded lead and organization APIs.
4. Safe conversion, internal notes, assignees and transactional audit.
5. Public IOD intake connected directly to Lead.
6. DSR foundation: data model, portal intake, CRM operations, identity verification and response preparation.
7. Next: notifications and event workflows for DSR deadlines, assignments and response preparation.

Next recommended PR: `[crm] add tasks notes and activity timeline`.

2026-07-10 breach module follow-up:

1. Run the breach migration only in the intended non-production environment first.
2. Smoke test CLIENT cross-tenant denial and READ_ONLY mutation denial.
3. Add secure breach attachments in a separate storage/ACL PR.
4. Keep production readiness at NO until staging migration, real auth smoke and rollback are verified.
5. Next recommended PR after this module: `[dsr] add data subject request module`.

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

## CRM commerce/document operations gap update

Closed or reduced by this PR:
- Add minimal Product/Order/OrderItem/Payment/PaymentEvent/Invoice models.
- Add CRM commerce/document permissions.
- Add CRM orders, payments, invoices, document jobs, generated documents, and download history APIs.
- Add safe serializers for provider/file data.
- Add audit logging for order note/status/owner, payment retry/review, invoice request/retry/cancel, document retry/review.
- Add smoke checklist because no test runner exists.

Remaining recommended PR:
- `[documents] add client document input flow`

Still gated:
- Live payment provider.
- Live invoice provider.
- Production migration.
- Production deploy.
- Client portal delivery.
