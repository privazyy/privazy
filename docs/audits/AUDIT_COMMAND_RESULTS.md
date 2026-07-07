# Audit Command Results

Date: 2026-07-07

Local results during this PR:

| Command | Result | Notes |
| ------- | ------ | ----- |
| `npm run prisma:generate` | PASS | Prisma Client generated. |
| `npx prisma validate` | FAIL without env | Expected local failure: `DIRECT_URL` is required by schema and was not set. |
| `npx prisma validate` with dummy `DATABASE_URL`/`DIRECT_URL` | PASS | Schema valid with non-production local dummy URLs. |
| `npm run lint` | PASS | ESLint completed. |
| `npm run typecheck` | PASS | TypeScript completed. |
| `npm run build` with dummy auth/database env | PASS | Next build completed. |
| `npm run test` | PASS | 9 files, 34 tests. |
| `npm run test:unit` | PASS | 1 file, 2 tests. |
| `npm run test:security` | PASS | 7 files, 29 tests. |
| `npm run test:smoke` | PASS | 1 file, 3 tests. |
| `npm run responsive:check` | PASS | Public/default responsive route matrix passed. |

Full verification is recorded in the PR description after final local runs.
