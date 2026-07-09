# DSR API

## Portal

- `GET /api/portal/dsr`
- `POST /api/portal/dsr`
- `GET /api/portal/dsr/[requestId]`
- `PATCH /api/portal/dsr/[requestId]/draft`
- `POST /api/portal/dsr/[requestId]/submit`

Portal requests require a `CLIENT` session with a `ClientProfile`. `organizationId` is never accepted from the body.

## CRM

- `GET /api/crm/dsr`
- `GET /api/crm/dsr/[requestId]`
- `PATCH /api/crm/dsr/[requestId]`
- `PATCH /api/crm/dsr/[requestId]/status`
- `POST /api/crm/dsr/[requestId]/verify-identity`
- `POST /api/crm/dsr/[requestId]/prepare-response`
- `POST /api/crm/dsr/[requestId]/notes`
- `GET /api/crm/dsr/[requestId]/timeline`

CRM read allows `ADMIN`, `LAWYER`, `OPERATOR`, `READ_ONLY`. CRM mutations allow `ADMIN`, `LAWYER`, `OPERATOR`, except response preparation which is limited to `ADMIN` and `LAWYER`.
