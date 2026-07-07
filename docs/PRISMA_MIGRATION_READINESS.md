# Prisma Migration Readiness

Status: `MANUAL_VERIFICATION_REQUIRED`

## Required Env

| Env | Purpose | Required for |
| --- | ------- | ------------ |
| `DATABASE_URL` | Runtime pooled connection | app runtime, `prisma generate`, `prisma validate`, `migrate status` |
| `DIRECT_URL` | Direct database connection | migrations and migration status |

## Local

1. Pull or create `.env.local`.
2. Confirm `DATABASE_URL` points to the intended local/dev database.
3. Confirm `DIRECT_URL` points to the direct non-pooling database connection.
4. Run:

```bash
npm run prisma:generate
npx prisma validate
npx prisma migrate status
```

Do not run `prisma migrate dev` against staging or production.

## Staging

1. Take or confirm a recent backup.
2. Confirm the staging Supabase project and connection strings.
3. Run `npx prisma migrate status` with staging env.
4. Apply migrations only through the approved staging migration process.
5. Record migration status and smoke-test private DB routes.

## Production

Production migration readiness is `NO` until:

- a verified backup exists,
- staging has the same migration plan applied successfully,
- rollback/restore owner is assigned,
- `DATABASE_URL` and `DIRECT_URL` are scoped to production only,
- migration output is captured in the release record.

## Manual Verification Marker

Use `MANUAL_VERIFICATION_REQUIRED` when repo-only checks cannot confirm real Supabase migration status.

