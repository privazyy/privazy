# Document Query Security Smoke Checklist

Use this checklist when a seeded local or staging database is available.

| Check | Expected |
| ----- | -------- |
| Anonymous tRPC call to `documents.listJobs` | `UNAUTHORIZED` |
| CLIENT with no `ClientProfile` calls `documents.listJobs` | `FORBIDDEN` |
| CLIENT for organization A passes organization B id | `FORBIDDEN`; no jobs returned |
| CLIENT omits `organizationId` | Jobs are filtered to ClientProfile organizations only |
| READ_ONLY calls `documents.listJobs` | Allowed read-only staff response |
| OPERATOR calls `documents.listJobs` with organization filter | Allowed staff response |
| `limit` above 100 | Validation error |
| `documents.listJobs` response | No `fileKey`, `docxFileKey`, `pdfFileKey`, or `zipFileKey` |
| `documents.activeTemplates` response | Only active template metadata; no `fileKey` or `variablesSchema` |
| CRM template rows | No raw storage key shown as secondary text |

