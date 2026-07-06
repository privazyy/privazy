# PRIVAZY Phase 2R migration plan

Target migration name: `phase_2r_data_model_reconcile`

This plan is intentionally conservative. Phase 2R creates a single reconciled target Prisma schema from `main` after the audit/security context, but it must not blindly stack the older draft migrations.

## Current baseline

`main` currently has one Prisma migration:

- `20260624212134_init`

The baseline schema contains only:

- `User`, `UserRole`
- `Organization`
- `ClientProfile`
- `DocumentTemplate`, `DocumentGenerationJob`, `GeneratedDocument`
- `FormSubmission`
- `AuditLog`

Phase 2R keeps those models and adds the wider target model around them.

## Current PR migration status

This PR does not include a generated `phase_2r_data_model_reconcile` migration directory.

Local migration generation was attempted with placeholder local URLs because this fresh checkout has no private `.env.local`:

```bash
npx prisma migrate dev --name phase_2r_data_model_reconcile --create-only
npx prisma migrate status
```

Both commands loaded the schema but stopped with `Schema engine error` while targeting `localhost:5432`. No migration directory was created. Generate the migration from a real local or staging database connection before merge/application.

## Required migration order

1. Start from a clean checkout of `origin/main`.
2. Verify no older draft branch migration has been applied to the target database.
3. Apply the Phase 2R `schema.prisma` change.
4. Generate the migration with:

   ```bash
   npx prisma migrate dev --name phase_2r_data_model_reconcile
   ```

5. Review the generated SQL before applying it anywhere shared.
6. Confirm the SQL is additive for existing tables unless a specific field expansion is documented.
7. Run:

   ```bash
   npm run prisma:generate
   npx prisma validate
   npm run prisma:seed
   npm run lint
   npm run typecheck
   npm run build
   ```

8. Run staging migration against a non-production Supabase database.
9. Run `npx prisma migrate status` against staging.
10. Only then merge Phase 2R and close or rebase conflicting draft PRs.

## Local database unavailable path

If `DATABASE_URL` or `DIRECT_URL` is missing, points at a placeholder, or no local/staging Postgres is reachable:

- do not hand-write a fake migration,
- do not invent a timestamped migration directory,
- keep `schema.prisma`, seed, and docs in the PR,
- document the failed migration attempt in the PR body,
- generate `phase_2r_data_model_reconcile` later from a real database connection.

This repo uses Supabase/Postgres. `DATABASE_URL` should normally be the pooled runtime URL and `DIRECT_URL` should be the direct migration URL.

## Draft PR conflict risks

Open draft PRs that can conflict with Phase 2R:

| PR | Branch | Conflict risk |
| --- | --- | --- |
| #5 | `codex/phase-2-data-model` | Adds an earlier broad Phase 2 schema, seed, and docs. Phase 2R supersedes it and should be reconciled instead of stacked. |
| #8 | `codex/phase-5-shop-checkout-payments` | Adds shop/order/payment/invoice migration work on top of draft Phase 2 assumptions. Expect model/name/status conflicts. |
| #9 | `codex/phase-7-operational-crm` | Adds CRM operational models and depends on Phase 5 branch. Expect task/lead/status/workflow conflicts. |
| #10 | `codex/phase-8-client-portal` | Adds portal/download/incident/request/message migration work on top of Phase 7. Expect overlap with documents, breach, DSAR, and messaging tables. |
| #11 | `codex/current-state-audit` | Documentation-only context. Low migration conflict, but its findings should remain referenced. |
| #12 | `codex/phase-1-security-reconcile` | Security/auth code and docs. It may rely on `ClientProfile`; Phase 2R keeps that model for compatibility. |

Recommended handling:

- Treat Phase 2R as the new schema baseline.
- Do not merge #5, #8, #9, or #10 migrations directly after Phase 2R without a rebase and migration diff review.
- Cherry-pick useful service/UI work from later PRs only after their schema assumptions are adapted to Phase 2R.

## Supabase RLS and Data API

Prisma creates tables, indexes, and relations, but it does not decide whether Supabase Data API roles can access those tables or which rows are visible.

Supabase changed Data API exposure behavior in 2026: new public-schema tables may require explicit grants before REST/GraphQL access. RLS is a separate layer and still needs reviewed policies. For Phase 2R:

- do not expose new tables to `anon` or `authenticated` automatically,
- create a follow-up SQL migration for grants and RLS policies,
- enable RLS before granting public/client access,
- avoid `auth.role()` checks in policies; prefer policy `TO` clauses plus ownership predicates,
- keep service-role and direct DB access server-side only.

## Staging verification

Use a non-production Supabase project or local Postgres:

```bash
cp .env.example .env.local
vercel env pull .env.local
supabase link --project-ref "$SUPABASE_PROJECT_REF"
npx prisma migrate dev --name phase_2r_data_model_reconcile
npx prisma migrate status
npm run prisma:seed
npm run prisma:generate
npm run lint
npm run typecheck
npm run build
```

Recommended manual checks:

- inspect generated SQL for destructive changes,
- verify existing tables are not dropped,
- verify money columns are integer cents,
- verify unique indexes on slugs, order numbers, invite token hashes, payment idempotency keys, and unsubscribe tokens,
- verify no seed creates real users, clients, leads, payments, invoices, or documents.

## Rollback considerations

Before applying to staging or production:

- take a database backup or snapshot,
- keep the generated SQL in review,
- do not mix Phase 2R with draft PR migrations in the same deploy,
- have a rollback path that restores the database snapshot if migration application fails,
- for partial migration failure, do not manually edit `_prisma_migrations`; use Prisma/Supabase recovery guidance and inspect the actual database state first.

Because this migration is expected to be additive, application rollback should be easier than database rollback. However, once any later feature writes to new tables, dropping them would lose data. Treat Phase 2R as a schema baseline, not a disposable feature branch, after merge.

## Recommended next PR

After Phase 2R:

1. Generate and verify the real migration in staging if not generated locally here.
2. Add Supabase RLS/grants SQL for the exact tables exposed through app/client APIs.
3. Rebase security/auth work onto the reconciled model.
4. Only then resume shop/CRM/portal feature PRs.
