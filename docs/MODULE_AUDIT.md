# MODULE AUDIT

## Phase 2 Data Model Result

Phase 2 adds the target Prisma data model for the full PRIVAZY platform. It does not implement the shop UI, checkout, client portal flows or CRUD screens.

### Existing Models Kept

- `User`
- `Organization`
- `ClientProfile`
- `DocumentTemplate`
- `DocumentGenerationJob`
- `GeneratedDocument`
- `AuditLog`
- `FormSubmission`

### Added Data Areas

- organization membership and invites
- billing profiles and organization settings
- contact people
- product catalog, variants and packages
- cart, orders, order items, payments, invoices, coupons and refunds
- CRM leads, activities, notes, deals, tasks and pipeline stages
- breach incidents, comments, attachments and timeline
- data subject requests and timeline events
- client message threads, client messages and client tasks
- compliance reviews and scores
- document inputs, template versions, generated files, downloads, reviews and updates
- blog categories, tags, posts and revisions
- newsletter subscribers, campaigns and events
- marketing events
- automation rules, runs and notifications
- generic file assets for private storage metadata

### Compatibility Notes

- Existing document generation models are not removed.
- Existing generated document file-key fields remain for compatibility.
- Existing lead capture can continue writing `FormSubmission`; normalized `Lead` rows can be created in a later phase and linked back through `formSubmissionId`.
- Existing code that imports current Prisma enums should continue to compile after `prisma generate`.
- No new public UI or business workflow is introduced by this phase.

### Money And Tax Decision

Amounts are stored as integer cents, for example `priceCents`, `totalCents`, `vatCents`.

VAT rates are stored as basis points in `vatRateBps`.

This avoids floating-point rounding issues and is sufficient for PLN-first checkout and invoice flows.

### Seed Result

`prisma/seed.mjs` seeds only non-sensitive starter configuration:

- product categories
- starter products and variants
- one package relationship
- blog categories
- default pipeline stages

The seed does not create real clients, organizations, orders, payments, users or sensitive data.

### Migration Status

The intended migration name is `phase_2_data_model`.

Current local result:

- `npm run prisma:migrate -- --name phase_2_data_model --create-only` was attempted.
- Prisma stopped before migration generation because `DIRECT_URL` was not available to the Prisma CLI environment.
- No manual migration file was created.

When the local or staging environment exposes a reachable non-production database through `DATABASE_URL` and `DIRECT_URL`, generate the migration with:

```bash
npm run prisma:migrate -- --name phase_2_data_model --create-only
```

Do not hand-write a fake migration without validating it against Prisma.

### Supabase Risk

Supabase changelog notes that new public-schema tables may not be exposed to Data API automatically. This is good for a security-first posture, but the team must explicitly decide grants, RLS and API exposure before using any of these tables from client-side Supabase code.

### Validation Checklist

- `npx prisma validate` passed with process-local placeholder database URLs.
- `npm run prisma:generate` passed with process-local placeholder database URLs.
- `npm run lint` passed.
- `npm run typecheck` passed.
- `npm run build` passed.
- Migration generation still requires a safe local/staging database environment.
