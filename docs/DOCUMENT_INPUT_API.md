# Document Input API

Client API:
- `GET /api/documents/inputs`
- `GET /api/documents/inputs/[inputId]`
- `POST /api/documents/inputs/from-order-item`
- `PATCH /api/documents/inputs/[inputId]/draft`
- `POST /api/documents/inputs/[inputId]/submit`

CRM API:
- `GET /api/crm/documents/inputs`
- `GET /api/crm/documents/inputs/[inputId]`
- `POST /api/crm/documents/inputs/[inputId]/needs-correction`
- `POST /api/crm/documents/inputs/[inputId]/lock`

Security:
- all routes require auth,
- CRM blocks CLIENT,
- mutations block READ_ONLY,
- Zod errors are returned safely,
- raw Prisma errors and stack traces are not exposed.
