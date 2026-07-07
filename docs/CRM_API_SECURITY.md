# CRM API security

This PR protects the current CRM API surface on `main`. It does not build CRM CRUD and does not change the public lead form endpoint.

## Central guard

CRM API guards live in `src/server/crm/api-guard.ts`.

- `requireCrmApiRead()` requires an authenticated user with role `ADMIN`, `LAWYER`, `OPERATOR`, or `READ_ONLY`.
- `requireCrmApiMutation()` requires an authenticated user with role `ADMIN`, `LAWYER`, or `OPERATOR`.
- `withCrmApiRead(handler)` wraps GET-style handlers.
- `withCrmApiMutation(handler)` wraps POST/PATCH/PUT/DELETE-style handlers.
- `crmApiError(error)` converts auth, permission, validation, and unexpected errors into safe JSON.

Response shape:

```json
{ "ok": true, "data": {} }
```

```json
{ "ok": false, "error": { "code": "ERROR_CODE", "message": "Safe message" } }
```

Unexpected server errors are logged on the server and returned to the client as a generic 500 without stack traces or raw Prisma details.

## Role policy

| Role | GET CRM API | Mutate CRM API | Notes |
| --- | --- | --- | --- |
| `ADMIN` | Yes | Yes | Can read and mutate CRM API. User/settings management remains a separate policy layer. |
| `LAWYER` | Yes | Yes | Can work with legal/operational CRM modules. No global settings role in this PR. |
| `OPERATOR` | Yes | Yes | Can work with lead/task/operational CRM modules. No role management. |
| `READ_ONLY` | Yes | No | Can read selected CRM API, cannot mutate. |
| `CLIENT` | No | No | No CRM API access. |
| Anonymous | No | No | Returns 401. |

## `/api/crm/leads`

GET is protected by `withCrmApiRead()`.

Query params are validated in `src/server/crm/leads.ts`:

- `limit`: integer, default `50`, max `100`
- `page`: integer, default `1`, max `500`
- `q`: optional search text, max `120`
- `source`: optional source filter, max `80`
- `status`: optional status/stage filter, max `60`

Returned fields are serialized through `serializeCrmLeadListItem()`:

- `id`
- `company`
- `industry`
- `source`
- `resultLabel`
- `value`
- `stage`
- `owner`
- `lastActivity`
- `hot`

The API does not return raw `FormSubmission.data`, contact details from the public lead payload, raw audit metadata, raw storage keys, stack traces, or raw Prisma errors.

POST/PATCH/PUT/DELETE are present only as guarded placeholders. They require mutation permission and then return a controlled 405 because full CRM CRUD is out of scope.

## Public lead endpoint

`/api/leads/iod` remains public. It is the public landing/checker submission endpoint. This PR intentionally does not add Turnstile or rate limiting; that remains `[security] add lead endpoint abuse protection`.

## Dependency note

PR #25 (`[security] protect private routes and CRM access`) is not assumed to be merged into `main`. This PR therefore adds the minimal CRM API-specific guard in `src/server/crm/*` instead of depending on unavailable helper files.
