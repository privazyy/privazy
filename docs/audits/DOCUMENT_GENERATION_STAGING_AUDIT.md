# Document Generation Staging Audit

| Step | Expected | Actual on `main` | Decision |
| --- | --- | --- | --- |
| 1. Paid OrderItem document | Required | OrderItem missing | MISSING |
| 2. Client sees document input | Required | DocumentInput missing | MISSING |
| 3. Client saves draft | Required | Missing | MISSING |
| 4. Client submits | Required | Missing | MISSING |
| 5. Generation job created | Required | Public `/api/documents/generate` creates job | FAIL |
| 6. Worker/Inngest picks job | Required | Inngest function exists | PARTIAL |
| 7. DOCX generated | Required | DOCX renderer exists | PARTIAL |
| 8. File uploaded to private R2 | Required | R2 upload helper exists | PARTIAL |
| 9. GeneratedDocument created | Required | Service creates `GeneratedDocument` | PARTIAL |
| 10. GeneratedDocumentFile created | Required | Model missing | MISSING |
| 11. Client sees ready/review | Required | Portal missing | MISSING |
| 12. Client secure download | Required | Download route missing | MISSING |
| 13. CRM sees job/document | Required | CRM shell lists generated docs/jobs | PARTIAL |
| 14. Download audit recorded | Required | Missing | MISSING |

Security findings:

- `/api/documents/generate` is public and accepts caller-controlled IDs.
- `document.generated` audit metadata includes `docxFileKey`.
- R2 signed URL helper exists but no permission-checked endpoint uses it.
- Job error messages persist raw exception messages.

Decision: `STAGING_NO_GO`.
