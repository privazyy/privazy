# Backup and Restore Runbook

Status: `MANUAL_VERIFICATION_REQUIRED`

## When To Backup

- Before any staging migration.
- Before any production migration.
- Before production deploys that change schema or document storage behavior.
- Before bulk data imports or cleanup jobs.

## Backup Checklist

1. Identify environment: staging or production.
2. Identify owner.
3. Confirm database project and timestamp.
4. Create or verify backup in Supabase.
5. Record backup ID/location in the release notes.
6. Confirm backup is restorable before destructive work.

## Restore Checklist

1. Stop writes or enable maintenance mode if appropriate.
2. Identify target restore point.
3. Confirm expected data loss window.
4. Restore into a safe target first when possible.
5. Run smoke checks.
6. Re-enable writes only after owner approval.

Restore has not been tested from this repo. Production readiness remains `NO` until restore is verified.

