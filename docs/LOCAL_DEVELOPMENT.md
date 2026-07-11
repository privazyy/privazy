# Local development

Use Node.js 22 LTS and npm (the committed `package-lock.json` is authoritative).

1. Run `npm ci`.
2. Copy variable names from `.env.example` to `.env.local`; use a disposable local/staging database, never production.
3. Set `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, `AUTH_URL=http://localhost:3000`, and `AUTH_TRUST_HOST=true` for local validation. Configure R2/Resend only for workflows being tested.
4. Without Docker, run `npm run db:local:start`. For the default local instance use `postgres://postgres:postgres@localhost:51214/template1?sslmode=disable&pgbouncer=true&connection_limit=1` as `DATABASE_URL`. Use the same URL without `pgbouncer=true` as `DIRECT_URL`. The pooler flag avoids prepared-statement conflicts in the embedded local server.
5. Run `npm run prisma:generate`, `npx prisma db push`, set a local-only `DEV_SEED_PASSWORD` (minimum 12 characters), then run `npm run db:seed`.
6. Run `npm run dev`.

Public URL: `http://localhost:3000`. Staff CRM: `http://localhost:3000/crm`. Test the roles `ADMIN`, `OPERATOR`, `LAWYER`, `READ_ONLY`, and `CLIENT`; `CLIENT` must be rejected and `READ_ONLY` writes must return 403.

Seed logins use `admin@privazy.local`, `operator@privazy.local`, `lawyer@privazy.local`, `read-only@privazy.local`, and `client@privazy.local`. All use the password supplied through `DEV_SEED_PASSWORD`; no password is stored in Git.

Common failures: missing `DIRECT_URL` blocks Prisma validation; missing `AUTH_SECRET` blocks login; an empty database should render controlled empty states; schema drift requires applying reviewed local migrations rather than pointing at production.
