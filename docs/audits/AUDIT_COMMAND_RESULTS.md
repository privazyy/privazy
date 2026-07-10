# Audit Command Results

Environment: fresh local clone at `C:\Users\alber\Desktop\privazy-ops-staging-verification-release-candidate-audit`, branch `codex/ops-staging-verification-release-candidate-audit`, target commit `f58b905cc903c05175822ff55b075fcb72df808d`.

No production database or production migration was used. Prisma commands used placeholder local PostgreSQL URLs only.

| Command | Result | Summary |
| --- | --- | --- |
| `npm ci` | PASS | 683 packages installed, 0 vulnerabilities |
| `npm run prisma:generate` | PASS | Prisma Client v6.19.3 generated |
| `npx prisma validate` | PASS | Schema valid |
| `npm run lint` | PASS | ESLint completed |
| `npm run typecheck` | FAIL then PASS | First parallel run happened while Prisma Client generation was in progress and reported missing generated Prisma types; sequential rerun passed |
| `npm run build` | PASS | Next build completed; `/admin`, `/api/crm/*`, `/api/documents/generate`, `/blog`, `/client`, `/documents`, `/uploads` built |
| `npm run test` | MISSING | `package.json` has no `test` script |
| `npm run test:security` | MISSING | `package.json` has no `test:security` script |
| `npm run test:smoke` | MISSING | `package.json` has no `test:smoke` script |
| `npm run env:check` | MISSING | `package.json` has no `env:check` script |
| `npm run env:check:staging` | MISSING | `package.json` has no `env:check:staging` script |
| `npm run responsive:check` | FAILED | Could not reach `http://localhost:3000`; app server was not running |
| `npm run db:migrate:status` | MISSING | `package.json` has no `db:migrate:status` script |

Required follow-up: add automated security/smoke test scripts and rerun against a real staging deployment.
