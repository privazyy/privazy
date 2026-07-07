# Audit Findings Delta

Date: 2026-07-07

## P0-003: Public document generation trusts client IDs

Status: `PARTIAL`

Resolved in this PR:

- `/api/documents/generate` now requires authentication.
- Document generation mutation requires `ADMIN`, `LAWYER`, or `OPERATOR`.
- `READ_ONLY`, `CLIENT`, and anonymous actors cannot generate documents through this endpoint.
- `createdById` is removed from the API contract and comes from the session actor.
- `organizationId` is verified against the database before job creation.
- `templateId` is verified against the database and must be `ACTIVE`.
- The service layer creates jobs only from `VerifiedDocumentGenerationContext`.
- Inngest receives only `jobId` and loads the trusted job state from the database.
- Public demo UI no longer submits arbitrary IDs.

Still open:

- CLIENT paid-order generation is blocked because the schema does not contain Order/OrderItem/Payment/Product/DocumentInput.
- Document read/query tenant scoping remains a separate P0 follow-up.
- Secure download ACL and raw storage-key exposure remain separate follow-ups.

