# Document Query Security Audit

Date: 2026-07-07
Scope: document job, generated document, template, CRM, and worker read paths on `main`.

## Inventory

| Query/entry point | Input IDs | Current access check | Required access check | Data returned | Risk | Status |
| ----------------- | --------- | -------------------- | --------------------- | ------------- | ---- | ------ |
| `documents.listJobs` tRPC query | `organizationId`, `status`, `limit` | NextAuth session plus organization scope helper | CLIENT must match `ClientProfile`; staff roles get explicit staff-wide read scope | Serialized jobs, template metadata, generated document metadata | Previously accepted arbitrary `organizationId` | Fixed |
| `documents.activeTemplates` tRPC query | `type`, `limit` | NextAuth session and role check | CLIENT/staff can read active metadata only | Serialized active template metadata | Previously returned full template rows including internals | Fixed |
| `src/server/crm/data.ts` CRM document rows | None from browser; server CRM loader | Existing CRM route/page controls plus server-side Prisma reads | Staff/CRM-only route guard in dedicated security PRs | CRM table rows | Raw template `fileKey` could appear in UI row secondary text | Fixed in row output |
| `src/server/documents/service.ts` generation worker reads | `jobId` internal | Inngest/internal flow | Worker loads job from DB and should not expose query response | Private template and file keys used server-side | Not a client query surface | Documented |
| `src/app/api/documents/generate` | Raw generation payload on current `main` | Public on current `main`; handled by PR #27 | Separate generation guard PR | Job creation response | P0-003, separate PR | Out of scope |

## Findings

- `documents.listJobs` was the direct P0-004 issue: any authenticated session could provide an arbitrary `organizationId` and receive document jobs for that tenant.
- `documents.activeTemplates` returned raw Prisma template rows. Because `DocumentTemplate` includes `fileKey` and `variablesSchema`, the query now uses an explicit `select` plus serializer.
- There are no existing tRPC detail queries such as `getJob`, `getGeneratedDocument`, or `getDocumentFiles` on `main`.
- Current membership is represented by `ClientProfile(userId, organizationId)`. There is no `OrganizationMember` or assignment model.
- Because no assignment model exists for LAWYER/OPERATOR, staff document read scope is documented as temporary staff-wide access for `ADMIN`, `LAWYER`, `OPERATOR`, and `READ_ONLY`.

## P0-004 Status

P0-004 is `FIXED` for current document query surfaces:

- arbitrary `organizationId` is blocked for CLIENT unless `ClientProfile` proves membership,
- CLIENT without organization scope is blocked,
- staff-wide access is explicit and role-based,
- `READ_ONLY` is read-only,
- query responses avoid raw storage keys,
- list queries have Zod validation and safe limits.

