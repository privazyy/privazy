# Supabase Readiness Checklist

Status: `MANUAL_VERIFICATION_REQUIRED`

| Check | Status | Notes |
| ----- | ------ | ----- |
| Staging Supabase project exists | MANUAL_VERIFICATION_REQUIRED | Verify in Supabase dashboard. |
| Production Supabase project exists | MANUAL_VERIFICATION_REQUIRED | Verify ownership and billing. |
| `DATABASE_URL` configured per env | MANUAL_VERIFICATION_REQUIRED | Runtime pooled connection. |
| `DIRECT_URL` configured per env | MANUAL_VERIFICATION_REQUIRED | Direct connection for migrations. |
| Connection pooling reviewed | MANUAL_VERIFICATION_REQUIRED | Required for serverless runtime. |
| Migrations applied to staging | MANUAL_VERIFICATION_REQUIRED | Run `prisma migrate status`. |
| Migrations applied to production | MANUAL_VERIFICATION_REQUIRED | Do not assume from repo. |
| Seed admin configured | MANUAL_VERIFICATION_REQUIRED | Must be idempotent and non-placeholder. |
| Backup exists before migration | MANUAL_VERIFICATION_REQUIRED | Capture timestamp and owner. |
| Restore test completed | MANUAL_VERIFICATION_REQUIRED | Must be tested before production GO. |
| RLS decision documented | MANUAL_VERIFICATION_REQUIRED | See RLS/Data API audit. |
| Data API exposure reviewed | MANUAL_VERIFICATION_REQUIRED | Exposed schemas can be reachable by anon/authenticated roles. |
| Grants reviewed | MANUAL_VERIFICATION_REQUIRED | Check anon/authenticated/service-role grants. |
| Public schema exposure reviewed | MANUAL_VERIFICATION_REQUIRED | Public schema needs explicit security review. |
| Service role key handling reviewed | MANUAL_VERIFICATION_REQUIRED | Never expose to browser. |
| Anon key exposure reviewed | MANUAL_VERIFICATION_REQUIRED | Public key is not authorization by itself. |
| Supabase Storage vs R2 decision | MANUAL_VERIFICATION_REQUIRED | Generated documents currently target R2 code paths. |
| Monitoring configured | MANUAL_VERIFICATION_REQUIRED | Database errors and connection limits need alerts. |

