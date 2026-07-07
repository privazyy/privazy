# Audit Command Results

This file records local validation for `[security] add audit-backed document download flow`.

| Command | Result | Notes |
| --- | --- | --- |
| `npm install` | Passed | Installed local dependencies for this checkout. |
| `npm run prisma:generate` | Passed | Generated Prisma Client after adding `DocumentDownload`. |
| `npm run typecheck` | Passed | TypeScript completed after narrowing download context types. |
| `npm run lint` | Passed | ESLint completed. |
| `npx prisma validate` | Blocked without env | Local environment has no `DIRECT_URL`; expected Prisma datasource prerequisite. |
| `DATABASE_URL=... DIRECT_URL=... npx prisma validate` | Passed | Prisma schema is valid with placeholder local datasource URLs. |
| `npm run responsive:check` | Passed | All configured viewport checks passed. |
| `DATABASE_URL=... DIRECT_URL=... AUTH_SECRET=... CLOUDFLARE_R2_*... npm run build` | Passed | Next production build completed and listed `/api/documents/files/[fileId]/download`. |
| `npm run test` | Not available | `main` package scripts do not define a test runner. |
| `npm run test:security` | Not available | `main` package scripts do not define a security test runner. |
| `npm run test:smoke` | Not available | `main` package scripts do not define a smoke test runner. |

Manual cross-tenant coverage is documented in `docs/DOCUMENT_DOWNLOAD_SECURITY_SMOKE_CHECKLIST.md`.
