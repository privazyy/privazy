# Document Generation Access Control

| Actor | Can generate | Conditions |
| ----- | ------------ | ---------- |
| Anonymous | No | Returns 401 for valid generation payloads. |
| CLIENT | No | Blocked until Order/OrderItem or DocumentInput ownership and payment checks exist. |
| READ_ONLY | No | Read-only role cannot perform document generation mutations. |
| OPERATOR | Yes | Staff-only manual flow; organization and active template verified server-side. |
| LAWYER | Yes | Staff-only manual flow; organization and active template verified server-side. |
| ADMIN | Yes | Staff-only manual flow; organization and active template verified server-side. |

## Required Server Checks

1. Resolve authenticated user through NextAuth.
2. Reload the user from Prisma so role decisions use current database state.
3. Require `ADMIN`, `LAWYER`, or `OPERATOR`.
4. Verify organization existence.
5. Verify template existence and `ACTIVE` status.
6. Create the job only after all checks pass.
7. Emit the Inngest event with `jobId` only.

## Future CLIENT Flow

When checkout and document-input models exist, CLIENT generation must use an owned resource such as `orderItemId` or `documentInputId`. The server must derive organization, user, template, product/document type, and paid state from the database. The client must not choose arbitrary `organizationId`, `templateId`, or `createdById`.

