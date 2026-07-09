# CRM invoices

Added:
- `GET /api/crm/invoices`
- `GET /api/crm/invoices/[invoiceId]`
- `POST /api/crm/orders/[orderId]/invoice`
- `POST /api/crm/invoices/[invoiceId]/retry`
- `POST /api/crm/invoices/[invoiceId]/cancel`

Invoices are mock/sandbox only in this PR. Live invoices remain disabled.

Invoice request copies buyer and totals from the order. The frontend cannot submit invoice totals. Duplicate active invoices for the same order are rejected.

Permissions:
- read: ADMIN, LAWYER, OPERATOR, READ_ONLY
- request/retry: ADMIN, OPERATOR
- cancel sandbox: ADMIN
- READ_ONLY mutation: blocked
- CLIENT: blocked

Audit events:
- `crm.invoice.requested`
- `crm.invoice.retry_issued_sandbox`
- `crm.invoice.cancelled_sandbox`
