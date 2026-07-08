# Audit Command Results

This file records local validation for `[security] add audit-backed document download flow`.

| Command | Result | Notes |
| --- | --- | --- |
| `npm ci` | Passed | Installed the committed lockfile; npm reported 0 vulnerabilities. |
| `npm run prisma:generate` | Passed | Generated Prisma Client after adding `DocumentDownload`. |
| `npm run typecheck` | Passed | TypeScript completed after narrowing download context types. |
| `npm run lint` | Passed | ESLint completed. |
| `npx prisma validate` | Blocked without env | Local environment has no `DIRECT_URL`; expected Prisma datasource prerequisite. |
| `DATABASE_URL=... DIRECT_URL=... npx prisma validate` | Passed | Prisma schema is valid with placeholder local datasource URLs. |
| `npm run responsive:check` | Passed | All configured viewport checks passed. |
| `DATABASE_URL=... DIRECT_URL=... AUTH_SECRET=... CLOUDFLARE_R2_*... npm run build` | Passed | Next production build completed and listed `/api/documents/files/[fileId]/download`. |
| Unauthenticated `POST /api/documents/files/[fileId]/download` | Passed | Live production-server smoke returned safe `401` JSON. |
| `npm audit --audit-level=high` | Passed | Reported 0 vulnerabilities. |
| `npm run test` | Not available | `main` package scripts do not define a test runner. |
| `npm run test:security` | Not available | `main` package scripts do not define a security test runner. |
| `npm run test:smoke` | Not available | `main` package scripts do not define a smoke test runner. |

Manual cross-tenant coverage is documented in `docs/DOCUMENT_DOWNLOAD_SECURITY_SMOKE_CHECKLIST.md`.

The first responsive command was intentionally attempted before a local server
was running and reported its expected prerequisite error. It passed after
starting the built application with the private local environment; no
production deployment or production migration was performed.
