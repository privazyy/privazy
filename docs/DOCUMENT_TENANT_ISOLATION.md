# Document Tenant Isolation

The current tenant boundary for CLIENT users is `ClientProfile`.

```text
User -> ClientProfile -> Organization -> DocumentGenerationJob / GeneratedDocument
```

## Organization Scope Rules

1. Every document job query starts with an authenticated user.
2. Staff readers use explicit role-based access.
3. CLIENT users derive organization scope from `ClientProfile`.
4. If CLIENT passes `organizationId`, the server verifies membership before using it.
5. If CLIENT omits `organizationId`, the server filters to all organizations linked to that user.
6. If no organization membership exists, document queries are blocked.

## Staff-Wide Read Access

`ADMIN`, `LAWYER`, `OPERATOR`, and `READ_ONLY` currently have staff-wide document read access. This is deliberate and documented because the schema does not yet include assignment models for specific lawyers/operators or CRM cases.

Future narrowing should introduce explicit assignment tables or organization membership for staff.

## Storage Keys

Raw storage keys such as `fileKey`, `docxFileKey`, `pdfFileKey`, and `zipFileKey` remain server-only. Document query responses expose metadata and status, not storage paths.

