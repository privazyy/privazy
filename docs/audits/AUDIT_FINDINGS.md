# Audit Findings Delta

Date: 2026-07-07

## P0-006: Missing env causes private route 500

Status: `FIXED`

Resolved in this PR:

- Added central env status and validation helpers.
- Added safe `ConfigurationError` helpers.
- `/admin` now checks session and staff role before DB access.
- `/admin` now returns a controlled `ConfigurationErrorState` when `DATABASE_URL` is missing instead of executing CRM Prisma reads.
- R2 and Resend missing-env errors now use safe configuration errors.

## P1-007: Staging/ops missing

Status: `PARTIAL`

Resolved in this PR:

- Added env inventory.
- Added staging readiness checklist.
- Added backup/restore, monitoring/alerting, rollback, maintenance, and staging smoke runbooks.

Still open:

- No real staging URL/database was verified from this repo.
- Staging smoke checks are manual.

## P1-010: Supabase/RLS/Data API/grants not verified

Status: `PARTIAL`

Resolved in this PR:

- Added Supabase readiness checklist.
- Added RLS/Data API audit checklist.
- Documented that Prisma uses DB connection strings and repo-only checks cannot verify dashboard grants.

Still open:

- RLS, Data API exposure, and grants require manual Supabase dashboard/DB verification.

