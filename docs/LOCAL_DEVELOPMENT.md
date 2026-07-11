# Local development

Use Node.js 22 LTS and npm (the committed `package-lock.json` is authoritative).

1. Run `npm ci`.
2. Copy variable names from `.env.example` to `.env.local`; use a disposable local/staging database, never production.
3. Set `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, `AUTH_URL=http://localhost:3000`, and `AUTH_TRUST_HOST=true` for local validation. Configure R2/Resend only for workflows being tested.
4. Run `npm run prisma:generate`, `npx prisma validate`, then `npm run prisma:migrate` against the disposable database.
5. If test users are required, run the documented Prisma seed only when `npm run db:seed` exists. This branch does not add or promise seeded passwords.
6. Run `npm run dev`.

Public URL: `http://localhost:3000`. Staff CRM: `http://localhost:3000/crm`. Test the roles `ADMIN`, `OPERATOR`, `LAWYER`, `READ_ONLY`, and `CLIENT`; `CLIENT` must be rejected and `READ_ONLY` writes must return 403.

Common failures: missing `DIRECT_URL` blocks Prisma validation; missing `AUTH_SECRET` blocks login; an empty database should render controlled empty states; schema drift requires applying reviewed local migrations rather than pointing at production.
