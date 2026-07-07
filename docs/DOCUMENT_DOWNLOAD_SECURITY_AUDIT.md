# Document Download Security Audit

| Area | Current behavior | Risk | Required behavior | Status |
| ---- | ---------------- | ---- | ----------------- | ------ |
| Generated document storage | `GeneratedDocument` stores `docxFileKey`, optional `pdfFileKey`, and optional `zipFileKey` server-side. | Raw keys can leak if models are returned directly. | Keep storage keys server-only and expose only synthetic file IDs. | Improved in this PR. |
| File identity | No separate `GeneratedDocumentFile` model exists on `main`. | Download flows could be tempted to accept raw storage keys. | Use a safe `fileId` derived from `generatedDocumentId.variant`. | Added. |
| Download endpoint | No protected download endpoint existed. | Users could not download through an audited permission gate. | Add private endpoint with session and server-side permission checks. | Added. |
| Permission check | Document download permissions were not centralized. | CLIENT could be implemented with client-side filtering or wrong org trust. | Resolve document/org from DB and check role/org server-side. | Added. |
| CLIENT access | No safe client download path existed. | Cross-tenant document access risk. | CLIENT can download only own-organization `GENERATED` or `DELIVERED` documents. | Added. |
| STAFF access | CRM read/download policy was not explicit. | Role drift and accidental mutations. | `ADMIN`, `LAWYER`, `OPERATOR`, and `READ_ONLY` can download non-draft generated documents through CRM/read policy. | Added. |
| READ_ONLY | No explicit download policy. | Read-only users could be blocked incorrectly or granted mutation paths. | READ_ONLY may create an audited download URL but cannot mutate/generate/retry. | Added for download only. |
| Signed URLs | R2 helper defaulted to 300 seconds. | Longer-lived links increase exposure window. | Default 60 seconds, capped at 300 seconds. | Added. |
| Download audit | No `DocumentDownload` model existed. | No proof of who obtained a signed URL. | Record successful signed URL issuance without signed URL or storage key. | Added. |
| Audit metadata | `document.generated` stored `docxFileKey`. | Raw storage key exposure in audit metadata. | Store variants and IDs, not raw keys. | Fixed for generation audit. |
| CRM document rows | CRM displayed template `fileKey` as row secondary text. | Raw template storage key exposure. | Display safe IDs and file variants only. | Fixed. |
| TRPC document router | Returned full template/generated document objects with raw keys. | Raw keys could reach authenticated clients. | Return safe selected fields and file descriptors. | Fixed. |
| R2 bucket privacy | Bucket is accessed through S3-compatible private helper. | Public bucket would expose documents. | Keep private bucket; do not add public URLs. | Preserved. |
| Automated tests | No test runner exists on `main`. | Cross-tenant cases are manual only. | Add smoke checklist until test harness exists. | Checklist added. |
