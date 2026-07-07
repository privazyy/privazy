# IOD Lead Security Smoke Checklist

Use this checklist when no automated security test runner is available on `main`.

## Public Endpoint

| Check | Expected Result |
| --- | --- |
| Submit valid payload with valid Turnstile token | `201` and `{ "ok": true }`; FormSubmission is created. |
| Submit duplicate email within one hour | `201` and `{ "ok": true }`; no second FormSubmission is created. |
| Submit payload with `website` honeypot filled | `201` and `{ "ok": true }`; no lead is created; abuse event is logged. |
| Submit missing required contact data | `400` with `validation_error`; no stack trace or Prisma error. |
| Submit unknown internal field such as `ownerId` | `400` with `validation_error`; no write. |
| Submit body above 20 KB | `400` with `bad_request`; no write. |
| Submit repeated invalid payloads from one IP | Eventually `429` with `rate_limited`. |
| Submit without Turnstile token in production-like env | `400` with `validation_error`; no write. |
| Submit with invalid Turnstile token | `403` with `forbidden`; no write. |
| Submit with missing Turnstile secret | `503` with `configuration_error`; no write. |

## CRM Boundary

| Check | Expected Result |
| --- | --- |
| Anonymous `GET /api/crm/leads` | `401`. |
| `CLIENT` role `GET /api/crm/leads` | `403`. |
| `READ_ONLY` role `GET /api/crm/leads` | `200`; read-only lead list. |
| `ADMIN`, `LAWYER`, or `OPERATOR` `GET /api/crm/leads` | `200`; lead list. |
