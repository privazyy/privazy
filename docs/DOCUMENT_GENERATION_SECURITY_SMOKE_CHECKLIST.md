# Document Generation Security Smoke Checklist

Run these checks after starting the app with local env configured.

| Check | Expected |
| ----- | -------- |
| `POST /api/documents/generate` with a valid payload and no session | 401 |
| `POST /api/documents/generate` with `createdById` in payload | 400 |
| `POST /api/documents/generate` as CLIENT with random `organizationId` | 403 or controlled not-ready response; no job created |
| `POST /api/documents/generate` as READ_ONLY | 403; no job created |
| `POST /api/documents/generate` as OPERATOR with existing organization and active template | 202; job created with `createdById` from session |
| `POST /api/documents/generate` as LAWYER with inactive template | 409; no job created |
| `POST /api/documents/generate` as ADMIN with missing organization | 404; no job created |
| Public `/documents` page | No public form submits arbitrary IDs |
| Inngest event payload | Contains `jobId` only |
| Generated audit log | Contains actor, organization, job id, template metadata, not full document input |

