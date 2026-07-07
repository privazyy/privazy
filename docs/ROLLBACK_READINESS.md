# Rollback Readiness

Status: `MANUAL_VERIFICATION_REQUIRED`

## Application Rollback

1. Identify the last known-good Vercel deployment.
2. Confirm env vars are compatible with that deployment.
3. Promote/rollback through Vercel.
4. Smoke test public route, auth route, private DB route, and critical API routes.

## Database Rollback

Database rollback is not the same as application rollback. Use backup/restore runbook and migration owner approval.

## Release Gate

Production readiness stays `NO` until:

- rollback owner is assigned,
- restore has been tested,
- smoke checks are documented,
- monitoring confirms healthy post-rollback state.

