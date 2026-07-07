# Supabase RLS and Data API Audit

Status: `MANUAL_VERIFICATION_REQUIRED`

The repo currently uses Prisma/Postgres connection strings for database access. It does not currently instantiate a browser Supabase client in app code, but `.env.example` includes public Supabase keys for future client integration. Because Supabase public-schema tables may be exposed through the Data API depending on project settings and grants, this must be verified in the Supabase dashboard.

## Dashboard Checks

1. Open Supabase Project Settings -> API.
2. Confirm which schemas are exposed through the Data API.
3. Confirm whether `public` is exposed.
4. For every exposed table, verify RLS state.
5. Verify grants for `anon`, `authenticated`, and service roles.
6. Confirm no service role key is used in browser-visible env.
7. Confirm anon/publishable keys are only used with RLS-backed access models.

## Tables From Current Prisma Schema

- `User`
- `Organization`
- `ClientProfile`
- `DocumentTemplate`
- `DocumentGenerationJob`
- `GeneratedDocument`
- `AuditLog`
- `FormSubmission`

## Recommendation

Treat RLS/Data API as `NOT_VERIFIED` until a privileged operator confirms dashboard exposure, grants, and policies. If Data API exposure is enabled for `public`, add explicit RLS policies before using browser Supabase clients for tenant data.

