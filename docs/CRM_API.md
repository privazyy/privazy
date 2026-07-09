# CRM API

All endpoints below require a staff CRM session. Read endpoints allow `READ_ONLY`; mutations require `ADMIN`, `LAWYER` or `OPERATOR`.

| Method | Path | Purpose |
| --- | --- | --- |
| GET, POST | `/api/crm/leads` | Paginated list / manual create |
| GET, PATCH | `/api/crm/leads/:leadId` | Detail / validated update |
| PATCH | `/api/crm/leads/:leadId/status` | Status change |
| PATCH | `/api/crm/leads/:leadId/assign` | Staff assignment |
| POST | `/api/crm/leads/:leadId/notes` | Internal note |
| POST | `/api/crm/leads/:leadId/convert` | Safe conversion |
| GET, POST | `/api/crm/organizations` | Paginated list / create |
| GET, PATCH | `/api/crm/organizations/:organizationId` | Detail / update or archive |
| POST | `/api/crm/organizations/:organizationId/notes` | Internal note |
| GET | `/api/crm/users` | Operational assignee options |

Lead list filters: `q`, `status`, `source`, `assignedToId`, `cursor`, `limit`.

Organization list filters: `q`, `status`, `industry`, `ownerId`, `cursor`, `limit`.

Unknown query/body fields are rejected. Errors use stable codes and safe messages; Prisma errors and stack traces are not returned. List serializers are smaller than detail serializers and omit raw snapshots/source metadata.
# CRM commerce/document operations API update

Added in `[crm] add orders payments invoices and document operations`:

Orders:
- `GET /api/crm/orders`
- `GET /api/crm/orders/[orderId]`
- `GET /api/crm/orders/[orderId]/timeline`
- `POST /api/crm/orders/[orderId]/notes`
- `PATCH /api/crm/orders/[orderId]`
- `PATCH /api/crm/orders/[orderId]/owner`
- `POST /api/crm/orders/[orderId]/cancel`
- `POST /api/crm/orders/[orderId]/invoice`

Payments:
- `GET /api/crm/payments`
- `GET /api/crm/payments/[paymentId]`
- `GET /api/crm/payments/[paymentId]/events`
- `POST /api/crm/payments/[paymentId]/retry-status`
- `POST /api/crm/payments/[paymentId]/review`

Invoices:
- `GET /api/crm/invoices`
- `GET /api/crm/invoices/[invoiceId]`
- `POST /api/crm/invoices/[invoiceId]/retry`
- `POST /api/crm/invoices/[invoiceId]/cancel`

Document operations:
- `GET /api/crm/documents/jobs`
- `GET /api/crm/documents/jobs/[jobId]`
- `POST /api/crm/documents/jobs/[jobId]/retry`
- `GET /api/crm/documents/generated`
- `GET /api/crm/documents/generated/[documentId]`
- `POST /api/crm/documents/generated/[documentId]/review`
- `POST /api/crm/documents/generated/[documentId]/approve`
- `POST /api/crm/documents/generated/[documentId]/reject`
- `GET /api/crm/documents/files/[fileId]/downloads`
- `GET /api/crm/documents/organizations/[organizationId]/downloads`

All routes use the CRM auth gate. READ_ONLY can read but cannot mutate. CLIENT is blocked. Serializers hide raw provider payloads and raw file keys.
