# CRM API security audit

Scope: inventory of CRM and admin API endpoints on `main` for PR `[security] protect CRM API routes`.

## Endpoint inventory

| Endpoint | Method | Public/private | Current auth | Required role | Data returned | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/api/crm/leads` | GET | Private CRM API | `withCrmApiRead()` | `ADMIN`, `LAWYER`, `OPERATOR`, `READ_ONLY` | Safe lead list items: id, company, industry, source, result label, value, stage, owner, last activity, hot flag | Protected | Returns IOD checker leads from `FormSubmission` through a serializer. Does not expose contact data, raw JSON payloads, audit metadata, Prisma errors, stack traces, or storage keys. |
| `/api/crm/leads` | POST/PATCH/PUT/DELETE | Private CRM API | `withCrmApiMutation()` | `ADMIN`, `LAWYER`, `OPERATOR` | No mutation payload; controlled 405 after authorization | Guarded, not implemented | Added so `READ_ONLY` and `CLIENT` are blocked before any future mutation path. Full CRUD remains out of scope. |
| `/api/leads/iod` | POST | Public lead form API | Public by design | Public | New lead id, organization id, checker result | Public, unchanged | This is the public landing/checker submission endpoint and must stay public. Abuse protection belongs to a later PR. |
| `/api/admin/*` | Any | N/A | N/A | N/A | N/A | Not present | No admin API routes exist on current `main`. |

## Related non-CRM APIs

`/api/documents/generate` remains outside this PR and is still tracked for `[security] gate document generation by auth and organization`.

The tRPC documents router remains outside this PR and is still tracked for `[security] enforce organization scope in document queries`.
