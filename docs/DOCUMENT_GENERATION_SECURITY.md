# Document Generation Security

Document generation is a privileged operation. A request may create persistent jobs, read private templates, render documents with personal data, and write generated files to private storage. It must never be public.

## Current Policy

The current implementation supports only temporary internal staff generation:

- `ADMIN`, `LAWYER`, and `OPERATOR` may create document generation jobs after authentication.
- `READ_ONLY` may not generate or retry documents.
- `CLIENT` may not generate documents through `/api/documents/generate` until a paid-order or document-input ownership gate exists.
- Anonymous users may not generate documents.

## Trusted Sources

- `createdById` comes from the authenticated session and the current database `User` record.
- `organizationId` is accepted only as a resource reference in the staff-only flow and must resolve to an existing organization.
- `templateId` is accepted only as a resource reference in the staff-only flow and must resolve to an `ACTIVE` `DocumentTemplate`.
- The service layer accepts `VerifiedDocumentGenerationContext`, not raw route payload.

## Audit

Every accepted generation request creates an `AuditLog` record with:

- `userId` from the session actor,
- `organizationId`,
- `entityType = DocumentGenerationJob`,
- `action = document.generation_requested`,
- minimal metadata about template, source, and optional staff reason.

The full `inputSnapshot` is not copied into audit metadata.

## Not Ready

The Prisma schema does not yet contain `Order`, `OrderItem`, `Payment`, `Product`, or `DocumentInput`. Because of that, CLIENT generation is intentionally blocked instead of pretending that a paid-order gate exists.

