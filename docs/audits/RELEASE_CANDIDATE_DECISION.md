# Release Candidate Decision

## Decision

`STAGING_NO_GO`

## Production decision

`PRODUCTION_NO`

## Reasons

The audited `main` branch builds, but it does not contain enough verified functionality, isolation, legal readiness, smoke coverage, or staging environment evidence to become a release candidate.

## Blocking issues

1. Public document generation endpoint without auth or org scope.
2. Missing portal and tenant-isolated client flows.
3. Missing commerce/payment/invoice foundation on `main`.
4. Missing breach/DSR/notification/CMS/newsletter modules on `main`.
5. Missing automated test/security/smoke scripts.
6. Supabase Data API/RLS and backups require manual staging dashboard verification.
7. Legal release documents are not approved/complete.

## Non-blocking issues

- Static blog can stay informational.
- CRM lead/org foundation can continue as partial staff tooling.
- Inngest/R2 helpers can be reused after access boundaries are fixed.

## Manual checks required

- Supabase grants/RLS/Data API.
- Vercel staging env scopes.
- Backups/monitoring.
- Staging role matrix with real users.
- R2 private bucket and signed download policy.

## Accepted risks

Only local code-quality checks are accepted as evidence. No runtime staging behavior is accepted without staging smoke.

## Rejected risks

Public document generation, missing tenant isolation, missing tests, missing legal docs, and unverified staging secrets are rejected as release-candidate risks.

## Recommended next actions

1. Close the P0 document-generation auth/org-scope gap.
2. Add automated security and smoke scripts.
3. Apply migrations to a disposable/staging DB.
4. Verify Supabase RLS/Data API manually.
5. Merge or explicitly defer missing module foundations.
6. Re-run the staging smoke plan.

Next recommended PR: `[launch] prepare controlled soft launch runbook`.
