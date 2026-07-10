# Supabase RLS and Data API Audit

Source context: Supabase changed Data API defaults in 2026 so new `public` schema tables may require explicit grants before exposure. Current repo audit used the Supabase changelog entry "Breaking Change: Tables not exposed to Data and GraphQL API automatically" as current platform context.

| Check | Repo evidence | Status | Manual staging steps |
| --- | --- | --- | --- |
| App uses Prisma direct DB | `prisma/schema.prisma`, `src/server/db/prisma.ts` | VERIFIED | Confirm staging `DATABASE_URL` uses non-production database |
| Frontend does not use service role key | No client import of `SUPABASE_SERVICE_ROLE_KEY` found | PARTIAL | Inspect Vercel env scopes and client bundle |
| `SUPABASE_SERVICE_ROLE_KEY` not in client bundle | `.env.example` keeps it non-public | PARTIAL | Verify deployed build env; search source maps if enabled |
| Anon key cannot read private tables | Not provable from repo | MANUAL_REQUIRED | Supabase Dashboard > Data API settings; test anon requests |
| Data API disabled or RLS configured | `supabase/config.toml` exposes `public`; initial migration has no RLS | MANUAL_REQUIRED/BLOCKED | Confirm grants/RLS for every table |
| Private tables not publicly readable | CRM migration revokes selected tables only | MANUAL_REQUIRED | Test `anon`/`authenticated` against all tables |
| Migrations are consistent | `npx prisma validate` PASS | PARTIAL | Apply to disposable/staging DB; run migration status |
| Backups configured | No repo evidence | MANUAL_REQUIRED | Supabase Dashboard > Database > Backups |
| Connection pooling described | `.env.example` documents `DATABASE_URL` pooled and `DIRECT_URL` direct | PARTIAL | Verify actual Vercel/Supabase env values |

Manual SQL/dashboard checklist:

1. Confirm Data API exposure setting for `public`.
2. For every table, list grants to `anon` and `authenticated`.
3. Confirm RLS enabled for `User`, `Organization`, `ClientProfile`, `DocumentTemplate`, `DocumentGenerationJob`, `GeneratedDocument`, `AuditLog`, `FormSubmission`, `Lead`, `ContactPerson`, `CrmNote`, `CrmTask`.
4. Confirm no table with personal data is readable by `anon`.
5. Confirm service-role keys exist only in server-side/staging secret scopes.
