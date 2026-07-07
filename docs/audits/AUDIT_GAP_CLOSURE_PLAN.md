# Audit gap closure plan

## Closed or reduced in this PR

1. Protect `/admin` with central proxy and server-side `requireCrmAccess()`.
2. Add role helper policy for staff, client, CRM read, and CRM mutation.
3. Add minimal `/login` route and callback handling.
4. Add controlled `/admin` configuration state for missing `DATABASE_URL`.
5. Add minimal CRM API guard for current `GET /api/crm/leads`.

## Still open

1. `[security] protect CRM API routes`
2. `[security] gate document generation by auth and organization`
3. `[security] enforce organization scope in document queries`
4. `[ops] add env validation and staging readiness checks`
5. `[test] add security and release smoke tests`
6. `[security] add lead endpoint abuse protection`

Recommended next PR: `[security] protect CRM API routes`.
