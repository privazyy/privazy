# PRIVAZY - Release Readiness

Decision: `NO-GO`

Staging: `NO`
Production: `NO`

The current `main` branch builds, lints and typechecks, but it is not safe for staging or production. The main blockers are public CRM/API surfaces, public document generation, missing tenant isolation, missing env readiness and incomplete commercial/document-delivery flows.

| Area | Status | Evidence | Release impact |
| --- | --- | --- | --- |
| Build | PASS | `npm run build` | Does not block. |
| Lint/typecheck | PASS | `npm run lint`, `npm run typecheck` | Does not block. |
| Prisma client | PASS | `npm run prisma:generate` | Does not block. |
| Prisma schema syntax | PASS | Dummy-env validate passed | Does not block. |
| Migration status | MANUAL_VERIFICATION_REQUIRED | Real `DIRECT_URL` absent | Blocks release verification. |
| Auth/route guards | FAIL | No middleware/proxy; public private routes | P0. |
| API authorization | FAIL | Public CRM lead and document-generation endpoints | P0. |
| Organization isolation | FAIL | tRPC accepts arbitrary `organizationId` | P0. |
| Public site | PARTIAL | Landing/blog/product route build | Not enough for launch. |
| Checkout/payments/invoices | MISSING | No models/APIs/providers | Blocks commercial release. |
| Document storage/download | PARTIAL | R2 helper only | Blocks secure document delivery. |
| CRM | PARTIAL/BROKEN | Data-backed shell, no guards/mutations | Blocks. |
| Client portal | SCAFFOLD/MISSING | `/client` placeholder, `/platforma` missing | Blocks client release. |
| Tests | MISSING | No scripts | Blocks launch confidence. |
| CI/CD | PARTIAL | Install/generate/lint/typecheck/build | Needs tests and release gates. |
| Env/secrets | PARTIAL | `.env.example` safe; no runtime validation | Blocks production readiness. |
| Legal readiness | MISSING/PARTIAL | Legal pages/approval missing | Blocks production. |

Minimum conditions for re-evaluation:

1. Protect private routes and APIs.
2. Enforce role rules for CLIENT and READ_ONLY.
3. Enforce server-side organization scoping.
4. Gate document generation by paid order or privileged staff action.
5. Add env validation and staging runbook.
6. Add minimum security/regression tests.
7. Verify Prisma migrations and Supabase RLS/Data API settings in a real non-production project.
