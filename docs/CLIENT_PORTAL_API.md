# Client Portal API

Added endpoints:
- `GET /api/portal/dashboard`
- `GET /api/portal/orders`
- `GET /api/portal/orders/[orderId]`
- `GET /api/portal/documents/inputs`
- `GET /api/portal/documents/generated`
- `GET /api/portal/documents/generated/[documentId]/download`
- `GET /api/portal/organization`
- `PATCH /api/portal/organization`

Security:
- auth required,
- role must be `CLIENT`,
- organization scope comes from `ClientProfile`,
- no trusted client-provided `organizationId`,
- Zod validation for query/update inputs,
- safe error responses,
- no raw Prisma errors or stack traces.
