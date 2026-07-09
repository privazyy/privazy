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
# CRM commerce/document operations gap update

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
