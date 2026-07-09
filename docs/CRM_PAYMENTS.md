# CRM payments

Added:
- `GET /api/crm/payments`
- `GET /api/crm/payments/[paymentId]`
- `GET /api/crm/payments/[paymentId]/events`
- `POST /api/crm/payments/[paymentId]/retry-status`
- `POST /api/crm/payments/[paymentId]/review`

Payment status comes from `Payment` and `PaymentEvent`. The CRM API exposes:
- provider
- mode
- status
- amount
- event count
- payloadHash
- safe event summary
- masked idempotency key in detail

Not exposed:
- raw webhook payload
- card data
- secrets

No normal operator action can mark a payment as PAID. Retry is limited to MOCK/SANDBOX provider records and writes audit.
