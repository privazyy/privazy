# Audit gap closure plan

## Reduced in this PR

1. Protect current `/api/crm/leads` from anonymous access.
2. Block `CLIENT` from CRM API.
3. Keep `READ_ONLY` read-only for CRM API.
4. Add central CRM API wrappers for read and mutation guards.
5. Add safe CRM API error shape.
6. Add query validation, bounded `limit`, pagination via `page`, and safe serialization for lead list responses.

## Still open

1. `[security] gate document generation by auth and organization`
2. `[security] enforce organization scope in document queries`
3. `[ops] add env validation and staging readiness checks`
4. `[test] add security and release smoke tests`
5. `[security] add lead endpoint abuse protection`
6. Full CRM CRUD authorization and audit trail for future mutating endpoints.

Recommended next PR: `[security] gate document generation by auth and organization`.
