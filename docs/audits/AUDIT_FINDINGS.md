# Audit Findings

| ID | Finding | Severity | Status | Notes |
| --- | --- | --- | --- | --- |
| P1-006 | Secure document download/audit flow is missing. | P1 | FIXED for current `GeneratedDocument` model | Added protected endpoint, permission helper, signed URL generation, and `DocumentDownload` audit. |
| P0-007 | Raw storage keys can appear in CRM/audit metadata. | P0 | PARTIAL | Removed known CRM/TRPC/audit response leaks. Storage keys still exist server-side in DB by design. |
| P1-DOC-TENANT | CLIENT document download needs tenant isolation. | P1 | FIXED for download endpoint | CLIENT access is checked against `ClientProfile.organizationId` resolved server-side. |
| P1-DOC-FILEMODEL | Per-file status/client visibility is missing. | P1 | OPEN | Current schema has document-level status only. Follow-up should add normalized file records when lifecycle needs it. |
| P1-TESTS | Automated cross-tenant download tests are missing. | P1 | OPEN | No test runner exists on `main`; smoke checklist added. |

Staging readiness remains NO or CONDITIONAL after this PR. Production readiness remains NO.
