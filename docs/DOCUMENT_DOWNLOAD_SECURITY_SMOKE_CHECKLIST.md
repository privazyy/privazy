# Document Download Security Smoke Checklist

Use this checklist until a test runner exists on `main`.

| Check | Expected result |
| --- | --- |
| Anonymous request to `/api/documents/files/[fileId]/download` | `401`; no signed URL; no `DocumentDownload`. |
| `CLIENT` from organization A downloads organization A `GENERATED` document | `200`; short signed URL returned; `DocumentDownload` created. |
| `CLIENT` from organization A downloads organization B document | Safe `404`; no signed URL; no normal `DocumentDownload`. |
| `CLIENT` downloads `DRAFT` document | `409`; no signed URL. |
| `CLIENT` sends raw R2 key instead of synthetic `fileId` | Safe `404`; no signed URL. |
| `READ_ONLY` downloads non-draft generated document | `200`; `DocumentDownload` created; no mutation beyond audit. |
| `OPERATOR`, `LAWYER`, or `ADMIN` downloads non-draft generated document | `200`; `DocumentDownload` created. |
| Missing document/file variant | Safe `404`; no stack trace. |
| Response body inspection | Contains no `docxFileKey`, `pdfFileKey`, `zipFileKey`, template `fileKey`, bucket name, Prisma error, or stack trace. |
| Signed URL TTL | `expiresAt` is about 60 seconds by default and never above 300 seconds. |
| CRM document rows | Show safe document IDs and variants, not raw keys. |
| TRPC document router | Returns `files` with `downloadUrlEndpoint`, not raw keys. |
