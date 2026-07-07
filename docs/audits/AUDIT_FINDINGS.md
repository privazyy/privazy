# Audit findings delta

This file records the audit delta for PR `[security] protect CRM API routes`.

## Status

- Overall go/no-go: NO-GO remains.
- Staging readiness: NO.
- Production readiness: NO.

## Updated findings

| ID | Finding | Status after PR | Notes |
| --- | --- | --- | --- |
| P0-002 | `/api/crm/leads` is public | FIXED | `GET /api/crm/leads` now requires CRM API read authorization. Anonymous users receive 401, `CLIENT` receives 403, and staff read roles can read safe serialized list data. Mutating methods require mutation authorization and return controlled 405 until CRUD exists. |
| P0-003 | `/api/documents/generate` is public and trusts client IDs | NOT FIXED | Intentionally left for `[security] gate document generation by auth and organization`. |
| P0-004 | tRPC document queries are not tenant scoped | NOT FIXED | Intentionally left for `[security] enforce organization scope in document queries`. |
| P0-007 | Raw storage keys can appear in CRM/audit metadata | NOT FIXED | This PR prevents `/api/crm/leads` from returning storage keys, but the wider CRM/audit/storage review remains open. |

P0-001, P0-005, and P0-006 are not marked fixed by this PR because the scope is CRM API routes.
