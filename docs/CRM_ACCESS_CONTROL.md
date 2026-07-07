# CRM access control

CRM access is split into page access and API access.

This PR covers CRM API access. It does not claim the full `/admin` page surface is fixed on `main`; that is handled by the separate `[security] protect private routes and CRM access` PR.

## API access

Private CRM API endpoints are under `/api/crm/*`.

Current protected endpoint:

- `/api/crm/leads`

Access rules:

- Anonymous users receive 401.
- `CLIENT` receives 403.
- `READ_ONLY` can use GET read endpoints.
- `READ_ONLY` receives 403 for POST/PATCH/PUT/DELETE.
- `OPERATOR`, `LAWYER`, and `ADMIN` can use read endpoints.
- `OPERATOR`, `LAWYER`, and `ADMIN` can pass mutation authorization, but this PR still returns 405 for lead mutations because CRUD is out of scope.

## Data minimization

CRM API responses must use serializers. `/api/crm/leads` uses `serializeCrmLeadListItem()` and returns only list fields needed by CRM. It does not return:

- contact phone or e-mail from the public lead payload,
- raw `FormSubmission.data`,
- raw audit metadata,
- raw storage keys,
- stack traces,
- raw Prisma errors.

## Follow-up

The next recommended PR is `[security] gate document generation by auth and organization`.
