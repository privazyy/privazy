# CRM operational timeline

This PR uses `AuditLog` as the guaranteed operational timeline layer because the activity timeline draft PR is not part of `main`.

Order timeline endpoint:
- `GET /api/crm/orders/[orderId]/timeline`

Audited events added in this PR:
- `crm.order.note_added`
- `crm.order.owner_assigned`
- `crm.order.status_updated`
- `crm.order.cancelled_sandbox`
- `crm.invoice.requested`
- `crm.invoice.retry_issued_sandbox`
- `crm.invoice.cancelled_sandbox`
- `crm.payment.retry_status`
- `crm.payment.reviewed`
- `crm.document_job.retry`
- `crm.document.marked_for_review`
- `crm.document.approved_for_client`
- `crm.document.rejected_for_client`

Metadata is minimal and redacted. Raw provider payloads, raw file keys, secrets, and card data are filtered before audit writes.
