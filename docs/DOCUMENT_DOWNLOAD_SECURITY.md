# Document Download Security

## Flow

1. UI uses a synthetic `fileId`, for example `generatedDocumentId.docx`.
2. UI calls `/api/documents/files/[fileId]/download`.
3. The endpoint reads the authenticated NextAuth session.
4. The endpoint parses `fileId` and loads `GeneratedDocument` from the database.
5. The endpoint derives the storage key server-side from the loaded document and requested variant.
6. The endpoint checks role and organization access.
7. The endpoint creates a short-lived R2 signed URL.
8. The endpoint writes `DocumentDownload`.
9. The endpoint returns `{ ok, url, expiresAt, file }`.

The client never sends or receives `docxFileKey`, `pdfFileKey`, `zipFileKey`, template `fileKey`, bucket name, or R2 credentials.

## Permission Policy

| Actor | Policy |
| --- | --- |
| Anonymous | Blocked with `401`. |
| `CLIENT` | Can download only documents connected to one of the user's `ClientProfile.organizationId` values. Status must be `GENERATED` or `DELIVERED`. |
| `READ_ONLY` | Can download through CRM/read policy for non-draft generated documents. This does not grant generate/retry/update permissions. |
| `OPERATOR` | Can download non-draft generated documents for operational handling. |
| `LAWYER` | Can download non-draft generated documents for legal review/handling. |
| `ADMIN` | Can download non-draft generated documents. |

Cross-tenant CLIENT attempts return a safe not-found response.

## File Readiness

Current `main` has no separate file status and no `clientVisible` field. The endpoint uses `GeneratedDocument.status`:

| Status | CLIENT | STAFF |
| --- | --- | --- |
| `DRAFT` | Blocked with `409`. | Blocked with `409`. |
| `GENERATED` | Allowed for own organization. | Allowed. |
| `DELIVERED` | Allowed for own organization. | Allowed. |
| `ARCHIVED` | Blocked for client. | Allowed for CRM read/download. |

Follow-up: add a normalized `GeneratedDocumentFile` model with per-file status and client visibility when the document lifecycle becomes richer.

## Signed URL TTL

`DOCUMENT_DOWNLOAD_SIGNED_URL_TTL_SECONDS` controls the TTL. The default is 60 seconds. Runtime clamps the value to 15-300 seconds.

Do not use public R2 URLs for private documents.
