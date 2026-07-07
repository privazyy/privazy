# GO/NO-GO Decision

## Decision

`NO-GO`

## Conditions

- Central private route/API guard exists and is tested.
- CLIENT cannot enter CRM.
- READ_ONLY cannot mutate.
- Organization isolation is enforced server-side.
- Document generation is gated by paid order or authorized staff action.
- Public lead endpoint has abuse protection.
- Real staging database migration status and Supabase RLS/Data API exposure are verified.
- Legal/release readiness docs define launch approval.

## P0 blockers

- P0-001: `/admin` has no auth/role guard.
- P0-002: `/api/crm/leads` is public.
- P0-003: `/api/documents/generate` is public and trusts client IDs.
- P0-004: tRPC document queries are not tenant scoped.
- P0-005: no central guard for private routes.
- P0-006: missing env causes private route 500.
- P0-007: raw storage keys can appear in CRM/audit metadata.

## P1 blockers

- Public IOD lead endpoint lacks rate limit/Turnstile.
- Checkout, payments and invoices are missing despite product claims.
- No tests exist for critical flows.
- Secure document download/audit flow is missing.
- Staging/Supabase migration/RLS verification is manual and not complete.
- Public legal documents and legal approval are missing.

## Accepted risks

- Static landing/blog can remain partial while treated as pre-release.
- Some CRM modules can remain empty/scaffold if hidden behind staff auth.
- Dependency deprecation warnings can be handled after security blockers.

## Not accepted risks

- Public CRM or lead export.
- Public document generation.
- Client-controlled organization/user IDs in mutations.
- Production payment/invoice claims without server-side flow.
- Public raw storage keys or unaudited direct downloads.

## Required next PRs

1. `[security] protect private routes and CRM access`
2. `[security] protect CRM API routes`
3. `[security] gate document generation by auth and organization`
4. `[security] enforce organization scope in document queries`
5. `[ops] add env validation and staging readiness checks`
6. `[test] add security and release smoke tests`
7. `[security] add lead endpoint abuse protection`
8. `[security] audit Supabase RLS and Data API exposure`

## Can proceed to staging?

`NO`

## Can proceed to production?

`NO`

## Status końcowy

- Staging: NO
- Production: NO
- P0 blockers: 7
- P1 blockers: 10
- Najważniejszy blocker: publiczny CRM/API oraz publiczne generowanie dokumentów bez auth, ról i izolacji organizacji.
- Następny rekomendowany PR: `[security] protect private routes and CRM access`
