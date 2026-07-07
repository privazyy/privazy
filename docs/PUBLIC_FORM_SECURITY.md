# Public Form Security

This document covers the public IOD lead form at `/api/leads/iod`.

## Controls

| Control | Status | Implementation |
| --- | --- | --- |
| Strict payload schema | Active | `src/server/leads/iod-schema.ts` accepts only the public form contract and rejects unknown fields. |
| Body size limit | Active | `src/app/api/leads/iod/route.ts` rejects bodies above 20 KB before processing. |
| IP rate limit | Active | Public requests are limited per hashed client IP. |
| Email rate limit | Active | Valid submissions are limited per normalized email. |
| Invalid-payload throttle | Active | Repeated malformed payloads from one IP are throttled. |
| Honeypot | Active | Filled hidden `website` field is logged and receives a neutral success response. |
| Turnstile | Active in configured environments | Server verification is required unless explicit non-production bypass is enabled. |
| Duplicate suppression | Active | Same email is suppressed for the IOD lead form within a one-hour window. |
| Data minimization | Active | Request metadata stores hashed IP, normalized referrer without query, and user-agent family. |

## Public Response Contract

Successful and duplicate/honeypot submissions return only:

```json
{ "ok": true }
```

Errors return safe public messages with one of these codes: `bad_request`, `validation_error`, `forbidden`, `rate_limited`, `configuration_error`, `internal_error`.

The endpoint must not expose CRM IDs, Prisma errors, stack traces, database URLs, tokens, raw IP addresses, or full user-agent strings.

## Private CRM Boundary

`/api/crm/leads` is not a public intake endpoint. It requires an authenticated NextAuth session with one of these read roles: `ADMIN`, `LAWYER`, `OPERATOR`, `READ_ONLY`.

`CLIENT` users and anonymous requests must not receive CRM lead data.
