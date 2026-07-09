# CRM commerce/documents smoke checklist

No test runner exists in `package.json`, so this PR adds a manual smoke checklist.

Permissions:
- [ ] Unauthenticated request to `/api/crm/orders` returns `401`.
- [ ] CLIENT request to `/api/crm/orders` returns `403`.
- [ ] READ_ONLY can read orders/payments/invoices/documents.
- [ ] READ_ONLY `POST /api/crm/orders/[id]/notes` returns `403`.
- [ ] OPERATOR can update allowed order status fields.
- [ ] OPERATOR cannot approve/reject generated documents.
- [ ] LAWYER can approve/reject generated documents.
- [ ] ADMIN can cancel sandbox order/invoice.

Orders:
- [ ] `GET /api/crm/orders?limit=10` returns paginated response.
- [ ] Filters reject invalid enum values.
- [ ] Order detail includes items, payments, invoices, document jobs, and generated documents.
- [ ] Totals come from database fields.

Payments:
- [ ] Payment list does not expose raw webhook payload.
- [ ] Payment event list shows eventType/status/payloadHash/safeSummary only.
- [ ] Retry status creates audit.
- [ ] No normal operator `mark as paid` exists.

Invoices:
- [ ] Invoice request creates mock/sandbox invoice from order totals.
- [ ] Duplicate active invoice request returns conflict.
- [ ] Retry mock invoice writes audit.

Documents:
- [ ] Document jobs list hides raw worker errors behind safe summary.
- [ ] Generated document detail does not expose raw fileKey.
- [ ] Download history requires staff CRM read access.
- [ ] Approve/reject writes audit.

Readiness:
- [ ] Staging remains NO/CONDITIONAL only after separate review.
- [ ] Production remains NO.
