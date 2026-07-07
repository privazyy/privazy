# Audit Gap Closure Plan

Date: 2026-07-07

## Closed Or Reduced In This PR

- Added minimal Vitest harness.
- Added test scripts and test directories.
- Added role fixtures with example.com emails.
- Added security tests for permissions, route classification, CRM API guards, document generation guard, tenant scope, serializers, env validation, and safe errors.
- Added release smoke tests.
- Added `repo-check` CI steps for security and smoke tests.

## Still Open

- P1-001 lead endpoint abuse protection: NOT FIXED.
- P1-002 checkout: NOT FIXED.
- P1-003 invoices/accounting: NOT FIXED.
- P1-006 secure document download endpoint: NOT FIXED.
- P1-007 staging verification: NOT FIXED.
- P1-008 legal docs completeness: NOT FIXED.
- Supabase RLS/Data API verification: MANUAL_REQUIRED.

## Next Recommended PR

`[security] add lead endpoint abuse protection`

That PR should add rate limiting and/or Turnstile enforcement for `/api/leads/iod`, then extend this new test harness with abuse-protection tests.
