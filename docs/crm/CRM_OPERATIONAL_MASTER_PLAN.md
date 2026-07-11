# CRM Operational Master Plan

This plan keeps `main`, draft PRs and future modules separate. The current PR implements a safe core step; it does not make the entire CRM production-ready.

| Phase | Goal | Scope | Models | Endpoints/UI | Roles | Tests | Acceptance | Out of scope |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Core CRM architecture | Shared permissions, schemas, errors, pagination, audit | `User`, `AuditLog` | `/crm`, shared helpers | ADMIN/LAWYER/OPERATOR/READ_ONLY | Role smoke | CLIENT blocked, READ_ONLY no mutate | Full IAM admin |
| 2 | Lead/org CRUD | Manual lead/org ops | `Lead`, `Organization` | Existing lead/org APIs/UI | Staff roles | API smoke | Create/edit/assign/convert | Public lead abuse protection |
| 3 | Contacts, notes, tasks, timeline | Operational work layer | `ContactPerson`, `CrmNote`, `CrmTask`, `AuditLog` | Task/contact/activity APIs and UI | Staff roles | Smoke checklist | Tasks and notes persist | Full calendar |
| 4 | Dashboard queues | Real operational dashboard | Existing CRM/doc tables | DB-backed KPIs/alerts | Read roles | Empty DB smoke | No mock numbers | BI reporting |
| 5 | Commerce ops | Orders/payments/invoices | New models | CRM lists/details | Staff, finance/crm | Provider-safe tests | Safe lists, no raw payloads | Live payments |
| 6 | Document ops | Inputs, jobs, generated files, downloads | Document input/file/download models | Retry/review/download APIs | LAWYER/ADMIN for review | Serializer tests | No raw fileKey | Public portal redesign |
| 7 | Breach ops | 72h workflow | Breach models | CRM breach APIs/UI | LAWYER/ADMIN | Deadline tests | Deadline/risk tracked | Legal automation |
| 8 | DSR ops | Request deadlines/identity | DSR models | CRM DSR APIs/UI | LAWYER/ADMIN | Deadline tests | Verification/response tracked | Full client self-service |
| 9 | Notifications/activity | Staff alerts/reminders | Notification, CrmActivity | Bell/list/read APIs | Staff | Payload tests | No sensitive payload | Marketing campaigns |
| 10 | Search/reporting | Unified filters | Indexes as needed | Lists with q/status/date/owner | Staff | Query smoke | Bounded queries | Full analytics |
| 11 | Hardening | QA and readiness | All | E2E/security smoke | All | CI tests | Staging conditional go | Production launch |

Next recommended PR: `[crm] harden operational CRM with QA, performance and release smoke tests`.
