# Document Generation Security Audit

Date: 2026-07-07
Scope: `/api/documents/generate`, public document request UI, document service, Inngest worker, related document queries.

## Entry Points

| Entry point | Method | Public/private | Current auth | Required access | Client-provided IDs | Status | Notes |
| ----------- | ------ | -------------- | ------------ | --------------- | ------------------- | ------ | ----- |
| `src/app/api/documents/generate/route.ts` | POST | Private | NextAuth session required | `ADMIN`, `LAWYER`, or `OPERATOR` staff role | `organizationId` and `templateId` are accepted only as resource references and verified server-side; `createdById` is rejected | Partial closure | Public job creation is closed. CLIENT flow remains blocked until Order/OrderItem or DocumentInput exists. |
| `src/components/forms/document-request-form.tsx` | UI | Public page, no mutation | No job creation from UI | None; placeholder only | No IDs are submitted | Closed for public creation | The previous demo form could submit arbitrary `organizationId`, `templateId`, and `createdById`. It now performs no POST. |
| `src/server/documents/service.ts` | Server function | Internal | Caller must pass verified context | Guard-resolved `VerifiedDocumentGenerationContext` | Does not accept client `createdById`; uses `actorUserId` from session | Hardened | Job and audit log are created in one transaction after guard resolution. |
| `src/server/inngest/functions.ts` | Worker event | Internal | Event is emitted only after route guard and job creation | `jobId` only | No organization/template IDs trusted from event | Hardened | Worker loads the job by `jobId` and does not use organization/template from event payload. |
| `src/server/trpc/routers/documents.ts` | Query | Private | `protectedProcedure` | Authenticated user | `organizationId` filter still accepted by query | Open follow-up | This PR does not close tenant scoping for document queries. Track as next PR. |

## Findings

- Before this PR, `/api/documents/generate` was public and created `DocumentGenerationJob` before any auth or authorization check.
- Before this PR, the API trusted `createdById` from the request body.
- Before this PR, the API accepted `organizationId` and `templateId` without checking that the actor could use them.
- The current Prisma schema has no `Order`, `OrderItem`, `Payment`, `Product`, or `DocumentInput` models, so a real paid-order gate cannot be implemented honestly in this PR.
- `DocumentGenerationJob`, `GeneratedDocument`, and `AuditLog` models exist, so staff-only generation with audit logging can be enforced now.

## Status

P0-003 is `PARTIAL`:

- Public document generation: closed.
- Anonymous job creation: blocked.
- `createdById` from client: removed/rejected.
- `organizationId` from client: verified server-side for staff-only flow.
- `templateId` from client: verified server-side and must be `ACTIVE`.
- CLIENT paid-order generation: not ready because order/input models do not exist.

