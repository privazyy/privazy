# Document Generation API

Endpoint: `POST /api/documents/generate`

Status: private staff-only API.

## Request

```json
{
  "organizationId": "existing-organization-id",
  "templateId": "active-template-id",
  "data": {
    "organizationName": "Example"
  },
  "reason": "Manual staff generation for reviewed request",
  "idempotencyKey": "optional-stable-key"
}
```

`createdById` is not accepted. The schema is strict, so unexpected fields are rejected with `400`.

## Response

Accepted:

```json
{
  "jobId": "created-job-id",
  "status": "PENDING"
}
```

Safe errors:

| Status | Meaning |
| ------ | ------- |
| 400 | Invalid JSON or invalid payload. |
| 401 | Authentication is required. |
| 403 | Actor does not have a permitted staff role. |
| 404 | Organization or template was not found. |
| 409 | Template exists but is not active. |
| 501 | CLIENT/order flow is not ready because paid-order models do not exist. |
| 500 | Safe internal failure without stack trace or raw Prisma details. |

## Event Contract

The route emits `document/generate.requested` with:

```json
{
  "jobId": "created-job-id"
}
```

The worker must load organization, template, creator, and input from the job row. It must not trust organization/template IDs from event payload.

