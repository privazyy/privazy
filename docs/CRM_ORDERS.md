# CRM orders

Added:
- `GET /api/crm/orders`
- `GET /api/crm/orders/[orderId]`
- `GET /api/crm/orders/[orderId]/timeline`
- `POST /api/crm/orders/[orderId]/notes`
- `PATCH /api/crm/orders/[orderId]`
- `PATCH /api/crm/orders/[orderId]/owner`
- `POST /api/crm/orders/[orderId]/cancel`
- `POST /api/crm/orders/[orderId]/invoice`

The CRM order view shows order number, organization, email, order status, payment status, invoice status, fulfillment status, gross total, item count, owner, and creation date.

Filters supported by API:
- status
- paymentStatus
- invoiceStatus
- fulfillmentStatus
- organizationId
- email
- dateFrom/dateTo
- productId
- documentType
- search query
- cursor/limit pagination

Mutations are staff-only and audited. READ_ONLY cannot mutate. CLIENT is blocked by the CRM API gate.
