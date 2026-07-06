# Production Migration Runbook

Status: **BLOCKED - do not run production migrations from this PR**

This runbook defines the required process. Real production migration execution requires manual approval, backup and a GO decision.

## Pre-migration

1. Freeze deploy window.
2. Confirm release commit and migration list.
3. Confirm no unmerged P0 blockers.
4. Confirm production DB connection owner.
5. Create database backup.
6. Verify backup exists and is restorable.
7. Confirm rollback strategy and irreversible migration risks.
8. Confirm Supabase RLS/Data API grants review.

## Migration

1. Put application in maintenance mode if required.
2. Apply migrations using the approved production process.
3. Run `prisma migrate status` against production.
4. Run `npm run prisma:generate` in the deployed build context if needed.
5. Run safe seed data only. Do not seed real clients or sensitive data.
6. Record migration timestamp, operator and commit SHA.

## Post-migration verification

| Check | Expected result |
| --- | --- |
| Admin login | Internal admin can authenticate. |
| Products | Expected products/catalog entries exist. |
| Templates | Required active templates exist. |
| Order flow | Sandbox/live switch remains disabled until approval. |
| Document generation | Disabled or tested according to launch flags. |
| RLS/grants | Access model verified. |
| Backup | Backup remains available after migration. |

## Stop conditions

- Backup cannot be verified.
- Migration status is unknown.
- RLS/grant review is missing.
- Smoke test fails after migration.
- Any data access anomaly appears.
