# CRM Operational Baseline Audit

Audit date: 2026-07-10. Base branch: `main` at `f58b905cc903c05175822ff55b075fcb72df808d`.

## Summary

The current CRM is no longer only a static UI shell. `main` already contains guarded staff CRM APIs for leads and organizations, Prisma models for contacts, notes and tasks, and a database-backed `/admin` page. It is still not a complete operational CRM because commerce, invoices, breach, DSR, notifications, download history and document review workflows are missing or represented through adjacent tables.

## Data Models

Real models: `User`, `Organization`, `ClientProfile`, `Lead`, `ContactPerson`, `CrmNote`, `CrmTask`, `AuditLog`, `FormSubmission`, `DocumentTemplate`, `DocumentGenerationJob`, `GeneratedDocument`.

Missing dedicated models: `Order`, `Payment`, `Invoice`, `DocumentInput`, `GeneratedDocumentFile`, `DocumentDownload`, `BreachIncident`, `DataSubjectRequest`, `Notification`, `CrmActivity`.

## CRM Area Matrix

| CRM Area | Current state | Data source | Mock/real | Security status | Operational status | Required work |
| --- | --- | --- | --- | --- | --- | --- |
| Dashboard | DB-backed counts and queues | Prisma service | Real/PARTIAL | Staff-only `/admin` | PARTIAL | More queues for commerce, breach, DSR |
| Leads | CRUD, status, assign, notes, convert | `Lead` | Real | Server role checks | READY for core ops | Add automated tests |
| Organizations | CRUD, detail, notes | `Organization` | Real | Server role checks | READY for core ops | More relationships |
| Contacts | Model and create endpoints | `ContactPerson` | Real/PARTIAL | Staff write only | PARTIAL | Edit/archive UI |
| Tasks | Model, APIs, dashboard/list/detail create | `CrmTask` | Real | Staff write only | READY/PARTIAL | Full task detail UI |
| Notes | Lead/org notes | `CrmNote` | Real | Staff write only | READY | Extend to other modules after models |
| Timeline | Audit-based timeline endpoints | `AuditLog` | Real/PARTIAL | Staff read only | PARTIAL | Dedicated `CrmActivity` later |
| Orders | Generation jobs shown as operational queue | `DocumentGenerationJob` | Partial proxy | Staff read | PARTIAL | Dedicated order model |
| Payments | No dedicated model | None | Missing | N/A | MISSING | Payment model/provider integration |
| Invoices | No dedicated model | None | Missing | N/A | MISSING | Invoice model/provider integration |
| Documents | Generated docs/jobs listed | `GeneratedDocument`, `DocumentGenerationJob` | Real/PARTIAL | Staff read | PARTIAL | Review/retry/secure download ops |
| Document inputs | Stored as snapshots/forms | JSON/FormSubmission | Partial | Public generate endpoint remains separate risk | PARTIAL | Dedicated input model |
| Generated files | Existing file keys in DB | Generated docs | Partial | Serializers must hide raw keys in APIs | PARTIAL | File/download model |
| Downloads | No history model | None | Missing | N/A | MISSING | Guarded download route/history |
| Breach incidents | No dedicated model | None | Missing | N/A | MISSING | Breach module PR |
| DSR requests | No dedicated model on this base | None | Missing | N/A | MISSING | DSR module PR/merge |
| CMS | Blog is code/content based | `src/lib/blog.ts` | Partial | Public only | PARTIAL | CMS PR/merge |
| Notifications | No staff notification table | Dashboard alerts from DB state | Partial | Staff UI only | PARTIAL | Notification model |
| Users/roles | Role enum and assignment list | `User` | Real | CLIENT blocked, READ_ONLY read-only | READY/PARTIAL | Admin user management |
| Settings | Role/schema info | Prisma enum/counts | Partial | Staff only | PARTIAL | Config tables |
| Audit log | Existing `AuditLog` | DB | Real | Staff read | READY/PARTIAL | Dedicated activity projection |

## Security Findings

- `/admin` redirects unauthenticated users and `CLIENT`.
- `/api/crm/*` uses server-side `requireCrmRead` or `requireCrmWrite`.
- `READ_ONLY` is blocked from CRM mutations by API guards.
- Public `/api/leads/iod` is separate from CRM API and does not accept CRM-only fields.
- Public `/api/documents/generate` remains outside this PR scope and should not be treated as CRM-ready.

## Recommended Implementation Order

1. Keep core staff guards and reusable validation.
2. Finish tasks, contacts and audit timeline.
3. Add dashboard operational queues from real tables.
4. Add document operation APIs and secure download history.
5. Add commerce models/views.
6. Add breach and DSR modules.
7. Add notifications, reporting and automated role-matrix tests.
