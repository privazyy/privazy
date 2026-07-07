# Audit Route Matrix Delta

Date: 2026-07-07

| Route/query | Method | Auth | Organization scope | Status |
| ----------- | ------ | ---- | ------------------ | ------ |
| `documents.listJobs` | tRPC query | Required | Staff role or `ClientProfile` membership | Fixed |
| `documents.activeTemplates` | tRPC query | Required | Active metadata only, no storage keys | Fixed |

